import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { BitacoraService } from '../bitacora/bitacora.service';
import { ReporteParametrosInput, ReporteParcial, ReporteResultado, ReporteTipo } from './reportes.types';

const ESTADOS_JUSTIFICACION = ['PENDIENTE', 'APROBADA', 'RECHAZADA'];

/**
 * Capa 1 — Reportes (núcleo, sin IA).
 *
 * Cada reporte es una consulta CONTROLADA con parámetros validados: no hay SQL
 * dinámico. Solo LECTURA. El control de acceso (solo admin / REPORTES_GENERAR)
 * lo aplica el guard en el resolver.
 */
@Injectable()
export class ReportesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bitacora: BitacoraService,
  ) {}

  async ejecutar(
    tipo: ReporteTipo,
    parametros?: ReporteParametrosInput,
  ): Promise<ReporteResultado> {
    const p = parametros ?? {};
    let parcial: ReporteParcial;

    switch (tipo) {
      case ReporteTipo.EMPLEADOS_POR_DEPARTAMENTO:
        parcial = await this.empleadosPorDepartamento(p.departamentoId, p.departamentoNombre);
        break;
      case ReporteTipo.ASISTENCIA_POR_PERIODO:
        parcial = await this.asistenciaPorPeriodo(p.desde, p.hasta, p.empleadoId);
        break;
      case ReporteTipo.JUSTIFICACIONES_POR_ESTADO:
        parcial = await this.justificacionesPorEstado(p.estado, p.desde, p.hasta);
        break;
      case ReporteTipo.ACCESOS_ARCHIVOS:
        parcial = await this.accesosArchivos(p.usuarioId, p.archivoId, p.desde, p.hasta, p.limit);
        break;
      default:
        throw new BadRequestException(`Reporte no soportado: ${tipo}`);
    }

    return { reporte: tipo, ...parcial, generadoEn: new Date() };
  }

  // ─────────────────────────── (a) Empleados por departamento ───────────────────────────
  private async empleadosPorDepartamento(
    departamentoId?: bigint,
    departamentoNombre?: string,
  ): Promise<ReporteParcial> {
    // Prioridad: ID exacto > nombre flexible (insensible a mayúsculas Y acentos,
    // parcial). El backend resuelve el nombre contra la lista de departamentos
    // (solo 4 filas) — Gemini NUNCA ve esa lista.
    let where: Prisma.EmpleadoWhereInput = {};
    if (departamentoId != null) {
      where = { departamentoId };
    } else if (departamentoNombre && departamentoNombre.trim()) {
      const term = this.normaliza(departamentoNombre);
      const deptos = await this.prisma.departamento.findMany({ select: { id: true, nombre: true } });
      const ids = deptos.filter((d) => this.normaliza(d.nombre).includes(term)).map((d) => d.id);
      if (ids.length === 0) {
        return {
          columnas: ['Nombre', 'Apellido', 'Departamento', 'Cargo', 'Estado'],
          filas: [],
          agregados: {
            total: 0,
            porDepartamento: {},
            nota: `Ningún departamento coincide con "${departamentoNombre}".`,
          },
        };
      }
      where = { departamentoId: { in: ids } };
    }

    const empleados = await this.prisma.empleado.findMany({
      where,
      include: { departamento: true, cargo: true },
      orderBy: [{ departamentoId: 'asc' }, { apellido: 'asc' }],
    });

    const filas = empleados.map((e) => ({
      nombre: e.nombre,
      apellido: e.apellido,
      departamento: e.departamento?.nombre ?? '—',
      cargo: e.cargo?.nombre ?? '—',
      estado: e.estado ?? '—',
    }));

    const porDepartamento: Record<string, number> = {};
    for (const e of empleados) {
      const k = e.departamento?.nombre ?? 'Sin departamento';
      porDepartamento[k] = (porDepartamento[k] ?? 0) + 1;
    }

    return {
      columnas: ['Nombre', 'Apellido', 'Departamento', 'Cargo', 'Estado'],
      filas,
      agregados: { total: empleados.length, porDepartamento },
    };
  }

  // ─────────────────────────── (b) Asistencia por período ───────────────────────────
  private async asistenciaPorPeriodo(
    desde?: string,
    hasta?: string,
    empleadoId?: bigint,
  ): Promise<ReporteParcial> {
    const where: Record<string, unknown> = {};
    if (empleadoId != null) where.empleadoId = empleadoId;
    const rango = this.rangoFechas(desde, hasta);
    if (rango) where.horaEntrada = rango;

    const regs = await this.prisma.registroAsistencia.findMany({
      where,
      include: { empleado: true },
      orderBy: { horaEntrada: 'desc' },
      take: 1000,
    });

    const filas = regs.map((r) => ({
      empleado: `${r.empleado.nombre} ${r.empleado.apellido}`,
      fecha: r.horaEntrada.toISOString().slice(0, 10),
      entrada: r.horaEntrada.toISOString().slice(11, 16),
      salida: r.horaSalida ? r.horaSalida.toISOString().slice(11, 16) : '—',
      estado: r.estado ?? '—',
      ubicacion: r.ubicacionGps ?? '—',
    }));

    const porEstado: Record<string, number> = {};
    for (const r of regs) {
      const k = r.estado ?? 'N/D';
      porEstado[k] = (porEstado[k] ?? 0) + 1;
    }
    const fechas = regs.map((r) => r.horaEntrada.toISOString().slice(0, 10)).sort();

    return {
      columnas: ['Empleado', 'Fecha', 'Entrada', 'Salida', 'Estado', 'Ubicación'],
      filas,
      agregados: {
        total: regs.length,
        porEstado,
        desde: fechas[0] ?? null,
        hasta: fechas[fechas.length - 1] ?? null,
      },
    };
  }

  // ─────────────────────────── (c) Justificaciones por estado ───────────────────────────
  private async justificacionesPorEstado(
    estado?: string,
    desde?: string,
    hasta?: string,
  ): Promise<ReporteParcial> {
    const where: Record<string, unknown> = {};
    if (estado) {
      const e = estado.toUpperCase();
      if (!ESTADOS_JUSTIFICACION.includes(e)) {
        throw new BadRequestException(
          `Estado inválido: "${estado}". Use PENDIENTE, APROBADA o RECHAZADA.`,
        );
      }
      where.estado = e;
    }
    const rango = this.rangoFechas(desde, hasta);
    if (rango) where.createdAt = rango;

    const justifs = await this.prisma.justificacionAusencia.findMany({
      where,
      include: { empleado: true, jefe: true },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    const filas = justifs.map((j) => ({
      empleado: `${j.empleado.nombre} ${j.empleado.apellido}`,
      fecha: j.createdAt.toISOString().slice(0, 10),
      estado: j.estado,
      canal: j.tipoCanal,
      mensaje: (j.mensajeOriginal ?? '').slice(0, 80),
      supervisor: j.jefe?.username ?? '—',
      comentario: j.comentarioJefe ?? '—',
    }));

    const porEstado: Record<string, number> = {};
    for (const j of justifs) {
      porEstado[j.estado] = (porEstado[j.estado] ?? 0) + 1;
    }

    return {
      columnas: ['Empleado', 'Fecha', 'Estado', 'Canal', 'Mensaje', 'Supervisor', 'Comentario'],
      filas,
      agregados: { total: justifs.length, porEstado },
    };
  }

  // ─────────────────────────── (d) Accesos a archivos (bitácora DynamoDB) ───────────────────────────
  private async accesosArchivos(
    usuarioId?: bigint,
    archivoId?: bigint,
    desde?: string,
    hasta?: string,
    limit?: number,
  ): Promise<ReporteParcial> {
    if (usuarioId == null && archivoId == null) {
      throw new BadRequestException(
        'El reporte de accesos requiere usuarioId O archivoId (DynamoDB consulta por clave, no por escaneo).',
      );
    }

    const rows =
      usuarioId != null
        ? await this.bitacora.queryPorUsuario(usuarioId, desde, hasta, limit ?? 100)
        : await this.bitacora.queryPorArchivo(archivoId as bigint, desde, hasta, limit ?? 100);

    const filas = rows.map((r) => ({
      fecha: r.timestamp,
      accion: r.accion,
      resultado: r.resultado ?? 'OK',
      usuario: r.usuarioId != null ? r.usuarioId.toString() : '—',
      documento: r.documentoS3Id != null ? r.documentoS3Id.toString() : '—',
      ip: r.ipOrigen ?? '—',
      plataforma: r.plataformaOrigen ?? '—',
      motivo: r.motivoDenegacion ?? '—',
    }));

    const porAccion: Record<string, number> = {};
    const porResultado: Record<string, number> = {};
    for (const r of rows) {
      porAccion[r.accion] = (porAccion[r.accion] ?? 0) + 1;
      const res = r.resultado ?? 'OK';
      porResultado[res] = (porResultado[res] ?? 0) + 1;
    }

    return {
      columnas: ['Fecha', 'Acción', 'Resultado', 'Usuario', 'Documento', 'IP', 'Plataforma', 'Motivo'],
      filas,
      agregados: { total: rows.length, porAccion, porResultado },
    };
  }

  /** Normaliza para comparar nombres: sin acentos, minúsculas, sin espacios extremos. */
  private normaliza(s: string): string {
    return s
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  }

  /**
   * Construye un rango Prisma { gte, lte } a partir de fechas. Si la fecha viene
   * como `YYYY-MM-DD` (sin hora) se interpreta en UTC y `hasta` cubre el día completo.
   */
  private rangoFechas(desde?: string, hasta?: string): { gte?: Date; lte?: Date } | undefined {
    const r: { gte?: Date; lte?: Date } = {};
    if (desde) r.gte = new Date(desde.includes('T') ? desde : `${desde}T00:00:00.000Z`);
    if (hasta) r.lte = new Date(hasta.includes('T') ? hasta : `${hasta}T23:59:59.999Z`);
    return r.gte || r.lte ? r : undefined;
  }
}
