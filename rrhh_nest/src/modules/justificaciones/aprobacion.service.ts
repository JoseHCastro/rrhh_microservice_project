import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import {
  AccionToken,
  EstadoJustificacion,
  JustificacionAusencia,
  JustificacionToken,
  TipoCanal,
} from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { S3Service } from '../../shared/s3/s3.service';
import { TelegramService } from '../../shared/telegram/telegram.service';

export interface UrlsAprobacion {
  urlAprobar: string;
  urlRechazar: string;
}

/** Presigned URL del adjunto de corta vida (15 min). */
const ADJUNTO_EXPIRA_SEG = 15 * 60;

export type ResultadoValidacion =
  | { ok: false; motivo: 'NO_EXISTE' | 'USADO' | 'EXPIRADO' | 'NO_PENDIENTE' }
  | { ok: true; token: JustificacionToken; justificacion: JustificacionAusencia };

@Injectable()
export class AprobacionService {
  private readonly logger = new Logger(AprobacionService.name);
  private readonly baseUrl: string;
  private readonly ttlHoras: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly telegram: TelegramService,
    config: ConfigService,
  ) {
    this.baseUrl = (config.get<string>('PUBLIC_BASE_URL') ?? 'http://localhost:3000').replace(/\/$/, '');
    this.ttlHoras = Number(config.get<string>('APROBACION_TOKEN_TTL_HORAS') ?? '168');
  }

  /** URL de la página/redirección para ver el adjunto, gateada por el token. */
  urlAdjunto(tokenPlano: string): string {
    return `${this.baseUrl}/api/v3/justificaciones/adjunto?token=${tokenPlano}`;
  }

  /**
   * Genera una presigned URL de S3 de 15 min para el adjunto de la justificación,
   * SOLO si el token es válido (no consume el token). El bucket nunca es público.
   */
  async presignedAdjuntoPorToken(
    tokenPlano: string,
  ): Promise<{ ok: true; url: string } | { ok: false; motivo: string }> {
    const v = await this.validar(tokenPlano);
    if (!v.ok) return { ok: false, motivo: v.motivo };
    if (!v.justificacion.archivoId) {
      return { ok: false, motivo: 'SIN_ADJUNTO' };
    }
    const archivo = await this.prisma.archivo.findUnique({
      where: { id: v.justificacion.archivoId },
    });
    if (!archivo) return { ok: false, motivo: 'SIN_ADJUNTO' };
    const url = await this.s3.getPresignedDownloadUrl(archivo.s3Key, ADJUNTO_EXPIRA_SEG);
    return { ok: true, url };
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private urlConfirmar(tokenPlano: string): string {
    return `${this.baseUrl}/api/v3/justificaciones/confirmar?token=${tokenPlano}`;
  }

  /**
   * Genera DOS tokens de un solo uso (uno para APROBAR, otro para RECHAZAR),
   * los guarda hasheados y devuelve las URLs de la página de confirmación.
   */
  async generarTokens(justificacionId: bigint): Promise<UrlsAprobacion> {
    const expiresAt = new Date(Date.now() + this.ttlHoras * 3600 * 1000);

    const crear = async (accion: AccionToken): Promise<string> => {
      const plano = randomBytes(32).toString('hex');
      await this.prisma.justificacionToken.create({
        data: { justificacionId, accion, tokenHash: this.hash(plano), expiresAt },
      });
      return plano;
    };

    const [pAprobar, pRechazar] = await Promise.all([
      crear(AccionToken.APROBAR),
      crear(AccionToken.RECHAZAR),
    ]);

    return {
      urlAprobar: this.urlConfirmar(pAprobar),
      urlRechazar: this.urlConfirmar(pRechazar),
    };
  }

  /** Valida un token SIN mutar (para la página de confirmación, que es GET). */
  async validar(tokenPlano: string): Promise<ResultadoValidacion> {
    const token = await this.prisma.justificacionToken.findUnique({
      where: { tokenHash: this.hash(tokenPlano) },
      include: { justificacion: true },
    });
    if (!token) return { ok: false, motivo: 'NO_EXISTE' };
    if (token.usedAt) return { ok: false, motivo: 'USADO' };
    if (token.expiresAt.getTime() < Date.now()) return { ok: false, motivo: 'EXPIRADO' };
    if (token.justificacion.estado !== EstadoJustificacion.PENDIENTE) {
      return { ok: false, motivo: 'NO_PENDIENTE' };
    }
    return { ok: true, token, justificacion: token.justificacion };
  }

  /**
   * Aplica la acción del token (esto SÍ muta — solo se llama desde el POST).
   * Marca el token como usado e invalida el token hermano (la otra acción).
   * Es atómico y re-valida dentro de la transacción para evitar dobles usos.
   */
  async resolver(tokenPlano: string): Promise<ResultadoValidacion> {
    const tokenHash = this.hash(tokenPlano);
    const resultado: ResultadoValidacion = await this.prisma.$transaction(async (tx) => {
      const token = await tx.justificacionToken.findUnique({
        where: { tokenHash },
        include: { justificacion: true },
      });
      if (!token) return { ok: false, motivo: 'NO_EXISTE' } as ResultadoValidacion;
      if (token.usedAt) return { ok: false, motivo: 'USADO' } as ResultadoValidacion;
      if (token.expiresAt.getTime() < Date.now()) {
        return { ok: false, motivo: 'EXPIRADO' } as ResultadoValidacion;
      }
      if (token.justificacion.estado !== EstadoJustificacion.PENDIENTE) {
        return { ok: false, motivo: 'NO_PENDIENTE' } as ResultadoValidacion;
      }

      const nuevoEstado =
        token.accion === AccionToken.APROBAR
          ? EstadoJustificacion.APROBADA
          : EstadoJustificacion.RECHAZADA;

      const justificacion = await tx.justificacionAusencia.update({
        where: { id: token.justificacionId },
        data: {
          estado: nuevoEstado,
          comentarioJefe: 'Resuelto por el supervisor vía correo.',
          resolvedAt: new Date(),
        },
      });

      // Invalidar TODOS los tokens de esta justificación (incluido el hermano)
      await tx.justificacionToken.updateMany({
        where: { justificacionId: token.justificacionId, usedAt: null },
        data: { usedAt: new Date() },
      });

      this.logger.log(
        `Justificación ${token.justificacionId} → ${nuevoEstado} (vía token de correo)`,
      );
      return { ok: true, token, justificacion } as ResultadoValidacion;
    });

    // Aviso al empleado por Telegram (Opción A). POST-COMMIT y blindado:
    // si Telegram falla, la justificación YA quedó resuelta — solo se loguea.
    if (resultado.ok) {
      try {
        await this.notificarEmpleado(resultado.justificacion);
      } catch (err) {
        this.logger.error(
          `Fallo notificando al empleado por Telegram (NO afecta la resolución): ${err}`,
        );
      }
    }

    return resultado;
  }

  /**
   * Envía al empleado el resultado (APROBADA/RECHAZADA) por Telegram.
   * Resuelve el chat_id desde canal_empleado (tipoCanal=TELEGRAM). Si el
   * empleado no tiene canal Telegram, omite el envío sin romper (warn).
   */
  private async notificarEmpleado(justificacion: JustificacionAusencia): Promise<void> {
    const canal = await this.prisma.canalEmpleado.findFirst({
      where: { empleadoId: justificacion.empleadoId, tipoCanal: TipoCanal.TELEGRAM },
    });
    if (!canal) {
      this.logger.warn(
        `Empleado ${justificacion.empleadoId} sin canal TELEGRAM — no se notifica el resultado de la justificación ${justificacion.id}`,
      );
      return;
    }

    const aprobada = justificacion.estado === EstadoJustificacion.APROBADA;
    const comentario = justificacion.comentarioJefe?.trim();
    const texto = aprobada
      ? `✅ Tu justificación #${justificacion.id} fue APROBADA.${comentario ? ' Comentario: ' + comentario : ''} Consulta el detalle en la app.`
      : `🚫 Tu justificación #${justificacion.id} fue RECHAZADA.${comentario ? ' Motivo: ' + comentario : ''} Consulta el detalle en la app.`;

    const r = await this.telegram.enviarMensaje(canal.identificador, texto);
    if (!r.ok) {
      // Fallo VISIBLE (mismo principio que la IA): no desaparece en silencio.
      this.logger.error(
        `No se pudo avisar al empleado ${justificacion.empleadoId} (chat ${canal.identificador}) sobre la justificación ${justificacion.id}: ${r.error}`,
      );
    }
  }
}
