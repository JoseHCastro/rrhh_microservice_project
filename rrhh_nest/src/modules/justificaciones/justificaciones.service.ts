import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EstadoJustificacion,
  JustificacionAusencia,
  TipoCanal,
} from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CanalesService } from '../canales/canales.service';
import type { AnalisisJustificacion } from '../../shared/ia/ia.types';
import {
  FiltrosJustificacionInput,
  ResolverJustificacionInput,
} from './justificacion.input';

export interface CrearJustificacionDesdeCanalParams {
  tipoCanal: TipoCanal;
  identificadorCanal: string;
  mensajeOriginal?: string | null;
  archivoId?: bigint | null;
  /** Análisis de IA (opcional). Son sugerencias, no decisión. */
  analisis?: AnalisisJustificacion | null;
  /** Motivo si la IA no pudo analizar (fallo visible). */
  iaError?: string | null;
}

export interface JustificacionCreadaDesdeWebhook {
  justificacion: JustificacionAusencia;
  empleadoNombreCompleto: string;
  jefeUsername: string | null;
}

@Injectable()
export class JustificacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly canales: CanalesService,
  ) {}

  async findAll(filtros: FiltrosJustificacionInput) {
    return this.prisma.justificacionAusencia.findMany({
      where: {
        ...(filtros.estado ? { estado: filtros.estado } : {}),
        ...(filtros.empleadoId ? { empleadoId: filtros.empleadoId } : {}),
        ...(filtros.jefeUsuarioId ? { jefeUsuarioId: filtros.jefeUsuarioId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: bigint): Promise<JustificacionAusencia> {
    const j = await this.prisma.justificacionAusencia.findUnique({ where: { id } });
    if (!j) throw new NotFoundException(`Justificación ${id} no existe`);
    return j;
  }

  /**
   * Crea una justificación desde un mensaje entrante por canal externo (n8n).
   *
   * 1. Resuelve qué empleado posee el `identificadorCanal`.
   * 2. Asigna como jefe al usuario del supervisor del empleado (si tiene).
   * 3. Crea la justificación PENDIENTE y devuelve datos útiles para que
   *    n8n arme el email al jefe.
   */
  async crearDesdeCanal(params: CrearJustificacionDesdeCanalParams): Promise<JustificacionCreadaDesdeWebhook> {
    const canal = await this.canales.findEmpleadoPorCanal(
      params.tipoCanal,
      params.identificadorCanal,
    );
    if (!canal) {
      throw new NotFoundException(
        `No hay empleado registrado para el canal ${params.tipoCanal}=${params.identificadorCanal}`,
      );
    }

    // Resolver el "jefe" via supervisor del empleado → buscar usuario del supervisor
    const empleadoConSupervisor = await this.prisma.$queryRaw<
      Array<{ supervisor_id: bigint | null }>
    >`SELECT supervisor_id FROM public.empleados WHERE id = ${canal.empleadoId}`;
    const supervisorId = empleadoConSupervisor[0]?.supervisor_id ?? null;

    let jefeUsuarioId: bigint | null = null;
    let jefeUsername: string | null = null;
    if (supervisorId) {
      const jefe = await this.prisma.$queryRaw<
        Array<{ id: bigint; username: string }>
      >`SELECT id, username FROM public.usuarios WHERE empleado_id = ${supervisorId} LIMIT 1`;
      if (jefe[0]) {
        jefeUsuarioId = jefe[0].id;
        jefeUsername = jefe[0].username;
      }
    }

    const ia = params.analisis;
    const justificacion = await this.prisma.justificacionAusencia.create({
      data: {
        empleadoId: canal.empleadoId,
        tipoCanal: params.tipoCanal,
        identificadorCanal: params.identificadorCanal,
        mensajeOriginal: params.mensajeOriginal,
        archivoId: params.archivoId,
        estado: EstadoJustificacion.PENDIENTE,
        jefeUsuarioId,
        // Campos IA (sugerencias). Solo se setean si hubo análisis.
        iaAnalizado: !!ia,
        documentoValidoIa: ia?.documentoValido ?? null,
        tipoSugeridoIa: ia?.tipoSugerido ?? null,
        diasReposoIa: ia?.diasReposo ?? null,
        diagnosticoIa: ia?.diagnosticoDeclarado ?? null,
        resumenIa: ia?.resumenParaSupervisor ?? null,
        recomendacionIa: ia?.recomendacion ?? null,
        confianzaIa: ia?.confianza ?? null,
        iaError: params.iaError ?? null,
      },
    });

    return {
      justificacion,
      empleadoNombreCompleto: `${canal.empleado.nombre} ${canal.empleado.apellido}`,
      jefeUsername,
    };
  }

  async aprobar(input: ResolverJustificacionInput, actorId: bigint) {
    const j = await this.findById(input.id);
    if (j.estado !== EstadoJustificacion.PENDIENTE) {
      throw new BadRequestException(`La justificación ya está ${j.estado}`);
    }
    return this.prisma.justificacionAusencia.update({
      where: { id: j.id },
      data: {
        estado: EstadoJustificacion.APROBADA,
        comentarioJefe: input.comentario,
        jefeUsuarioId: j.jefeUsuarioId ?? actorId,
        resolvedAt: new Date(),
      },
    });
  }

  async rechazar(input: ResolverJustificacionInput, actorId: bigint) {
    const j = await this.findById(input.id);
    if (j.estado !== EstadoJustificacion.PENDIENTE) {
      throw new BadRequestException(`La justificación ya está ${j.estado}`);
    }
    return this.prisma.justificacionAusencia.update({
      where: { id: j.id },
      data: {
        estado: EstadoJustificacion.RECHAZADA,
        comentarioJefe: input.comentario,
        jefeUsuarioId: j.jefeUsuarioId ?? actorId,
        resolvedAt: new Date(),
      },
    });
  }
}
