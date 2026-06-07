import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Archivo, CategoriaArchivo, EstadoArchivo } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { S3Service } from '../../shared/s3/s3.service';
import { BitacoraService } from '../bitacora/bitacora.service';
import { AccionBitacora } from '../bitacora/bitacora.enums';
import { IaService } from '../../shared/ia/ia.service';
import type { AnalisisJustificacion } from '../../shared/ia/ia.types';
import { CanalesService } from '../canales/canales.service';
import { JustificacionesService } from '../justificaciones/justificaciones.service';
import { AprobacionService } from '../justificaciones/aprobacion.service';
import {
  WebhookJustificacionDto,
  WebhookJustificacionResponse,
} from './webhooks.dto';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly ia: IaService,
    private readonly canales: CanalesService,
    private readonly justificaciones: JustificacionesService,
    private readonly aprobacion: AprobacionService,
    private readonly bitacora: BitacoraService,
  ) {}

  /**
   * Flujo n8n:
   * 1. Resuelve el empleado por su canal (chat_id de Telegram).
   * 2. Si hay adjunto: lo sube a S3 + lo manda a la IA para analizarlo.
   * 3. Crea la JustificacionAusencia (PENDIENTE) con el análisis de IA.
   * 4. Genera tokens de aprobación de un solo uso.
   * 5. Devuelve a n8n el resumen IA + URLs para el correo al supervisor.
   */
  async procesarJustificacion(
    dto: WebhookJustificacionDto,
    ip: string | null,
  ): Promise<WebhookJustificacionResponse> {
    const canal = await this.canales.findEmpleadoPorCanal(
      dto.tipoCanal,
      dto.identificadorCanal,
    );
    if (!canal) {
      throw new NotFoundException(
        `No hay empleado registrado para el canal ${dto.tipoCanal}=${dto.identificadorCanal}`,
      );
    }

    // ── Adjunto (si vino) → decodificar una vez, reutilizar para S3 e IA ──
    let archivoId: bigint | null = null;
    let buffer: Buffer | null = null;
    let contentType = dto.contentType ?? 'application/octet-stream';
    if (dto.archivoBase64) {
      buffer = this.decodificar(dto.archivoBase64);
      const archivo = await this.subirArchivo(dto, canal.empleadoId, buffer, contentType);
      archivoId = archivo.id;
      await this.bitacora.registrar({
        usuarioId: canal.empleadoId,
        archivoId,
        accion: AccionBitacora.SUBIR_S3,
        ipOrigen: ip,
        plataforma: 'TELEGRAM',
      });
    }

    // ── Análisis de IA (opt-in). Falla VISIBLE: si no analiza, guardamos el motivo ──
    let analisis: AnalisisJustificacion | null = null;
    let iaError: string | null = null;
    try {
      const r = await this.ia.analizar({
        mensaje: dto.mensaje,
        archivo: buffer ? { buffer, contentType } : null,
      });
      analisis = r.analisis;
      iaError = r.error;
    } catch (err: any) {
      iaError = `Excepción inesperada en IA: ${err?.message ?? err}`;
      this.logger.error(iaError);
    }

    // ── Crear la justificación con el análisis (o el motivo del fallo) ──
    const resultado = await this.justificaciones.crearDesdeCanal({
      tipoCanal: dto.tipoCanal,
      identificadorCanal: dto.identificadorCanal,
      mensajeOriginal: dto.mensaje,
      archivoId,
      analisis,
      iaError,
    });

    // ── Tokens de aprobación de un solo uso ──
    const urls = await this.aprobacion.generarTokens(resultado.justificacion.id);

    return {
      ok: true,
      justificacionId: resultado.justificacion.id.toString(),
      archivoId: archivoId?.toString() ?? null,
      empleadoNombreCompleto: resultado.empleadoNombreCompleto,
      jefeUsername: resultado.jefeUsername,
      mensaje: dto.mensaje ?? '',
      ia: {
        analizado: !!analisis,
        error: iaError,
        recomendacion: analisis?.recomendacion ?? null,
        confianza: analisis?.confianza ?? null,
        resumen: analisis?.resumenParaSupervisor ?? null,
        diagnosticoDeclarado: analisis?.diagnosticoDeclarado ?? null,
        documentoValido: analisis?.documentoValido ?? null,
        diasReposo: analisis?.diasReposo ?? null,
      },
      urlAprobar: urls.urlAprobar,
      urlRechazar: urls.urlRechazar,
    };
  }

  private decodificar(base64: string): Buffer {
    const limpio = base64.includes(',') ? base64.split(',', 2)[1]! : base64;
    try {
      return Buffer.from(limpio, 'base64');
    } catch {
      throw new BadRequestException('archivoBase64 inválido');
    }
  }

  private async subirArchivo(
    dto: WebhookJustificacionDto,
    empleadoId: bigint,
    buffer: Buffer,
    contentType: string,
  ): Promise<Archivo> {
    const ext = this.extFromFilename(dto.filename) || this.extFromContentType(contentType);
    const s3Key = `justificaciones/${empleadoId}/${uuidv4()}${ext}`;
    await this.s3.putObject(s3Key, buffer, contentType);

    return this.prisma.archivo.create({
      data: {
        nombre: dto.filename ?? `justificacion-${new Date().toISOString()}`,
        descripcion: `Recibido via ${dto.tipoCanal}`,
        categoria: CategoriaArchivo.JUSTIFICACION_AUSENCIA,
        s3Key,
        contentType,
        tamanioBytes: BigInt(buffer.length),
        empleadoId,
        privilegioLecturaCodigo: 'ARCHIVO_LEER_CERTIFICADO_MEDICO',
        privilegioDescargaCodigo: 'ARCHIVO_DESCARGAR_CERTIFICADO_MEDICO',
        subidoPorId: await this.resolverUsuarioIdDelEmpleado(empleadoId),
        estado: EstadoArchivo.ACTIVO,
      },
    });
  }

  private async resolverUsuarioIdDelEmpleado(empleadoId: bigint): Promise<bigint> {
    const rows = await this.prisma.$queryRaw<Array<{ id: bigint }>>`
      SELECT id FROM public.usuarios WHERE empleado_id = ${empleadoId} LIMIT 1
    `;
    if (rows[0]) return rows[0].id;
    return 1n;
  }

  private extFromFilename(filename?: string): string {
    if (!filename) return '';
    const i = filename.lastIndexOf('.');
    return i >= 0 ? filename.substring(i) : '';
  }

  private extFromContentType(contentType?: string): string {
    if (!contentType) return '';
    const map: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
    };
    return map[contentType] ?? '';
  }
}
