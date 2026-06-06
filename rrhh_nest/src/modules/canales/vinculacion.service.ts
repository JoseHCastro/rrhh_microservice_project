import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { TipoCanal } from '@prisma/client';
import { createHash, randomInt } from 'crypto';
import { PrismaService } from '../../shared/prisma/prisma.service';

const CODIGO_LEN = 8;
// Charset sin caracteres ambiguos (0/O, 1/I) — fácil de teclear.
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const EXPIRA_SEG = 5 * 60;
const MAX_POR_HORA = 5;

export interface ResultadoConfirmacion {
  ok: boolean;
  motivo?: string;
  empleadoNombreCompleto?: string;
  reVinculado?: boolean;
}

@Injectable()
export class VinculacionService {
  private readonly logger = new Logger(VinculacionService.name);

  constructor(private readonly prisma: PrismaService) {}

  private hash(codigo: string): string {
    return createHash('sha256').update(codigo.toUpperCase()).digest('hex');
  }

  private generarCodigo(): string {
    let c = '';
    for (let i = 0; i < CODIGO_LEN; i++) c += CHARSET[randomInt(CHARSET.length)];
    return c;
  }

  /**
   * Genera un código de vinculación para el empleado (tomado del JWT).
   * Invalida los previos no usados, aplica rate-limit y expira en 5 min.
   */
  async generar(
    empleadoId: bigint,
    tipoCanal: TipoCanal,
  ): Promise<{ codigo: string; expiraEnSegundos: number }> {
    // Rate-limit: máx MAX_POR_HORA en la última hora por empleado.
    const haceUnaHora = new Date(Date.now() - 3600 * 1000);
    const recientes = await this.prisma.codigoVinculacion.count({
      where: { empleadoId, createdAt: { gte: haceUnaHora } },
    });
    if (recientes >= MAX_POR_HORA) {
      throw new HttpException(
        'Demasiados códigos generados. Intenta de nuevo en una hora.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Invalidar códigos previos no usados de este empleado/canal.
    await this.prisma.codigoVinculacion.updateMany({
      where: { empleadoId, tipoCanal, usedAt: null },
      data: { usedAt: new Date() },
    });

    const codigo = this.generarCodigo();
    await this.prisma.codigoVinculacion.create({
      data: {
        empleadoId,
        tipoCanal,
        codigoHash: this.hash(codigo),
        expiresAt: new Date(Date.now() + EXPIRA_SEG * 1000),
      },
    });

    this.logger.log(`Código de vinculación ${tipoCanal} generado para empleado ${empleadoId}`);
    return { codigo, expiraEnSegundos: EXPIRA_SEG };
  }

  /**
   * Confirma la vinculación desde el bot (vía n8n). Valida el código, evita
   * robo de chat_id ajeno, crea/actualiza el canal verificado y marca el código.
   */
  async confirmar(
    codigo: string,
    tipoCanal: TipoCanal,
    identificadorCanal: string,
  ): Promise<ResultadoConfirmacion> {
    if (!codigo || !identificadorCanal) {
      return { ok: false, motivo: 'Faltan datos (código o identificador).' };
    }

    const tokenHash = this.hash(codigo);
    const cod = await this.prisma.codigoVinculacion.findFirst({
      where: { codigoHash: tokenHash, tipoCanal },
      orderBy: { createdAt: 'desc' },
    });
    if (!cod) return { ok: false, motivo: 'Código inválido.' };
    if (cod.usedAt) return { ok: false, motivo: 'El código ya fue utilizado.' };
    if (cod.expiresAt.getTime() < Date.now()) {
      return { ok: false, motivo: 'El código expiró. Genera uno nuevo en la app.' };
    }

    const empleadoId = cod.empleadoId;

    // ¿El chat_id ya está vinculado a OTRO empleado?
    const porChat = await this.prisma.canalEmpleado.findUnique({
      where: { tipoCanal_identificador: { tipoCanal, identificador: identificadorCanal } },
    });
    if (porChat && porChat.empleadoId !== empleadoId) {
      return { ok: false, motivo: 'Este Telegram ya está vinculado a otra cuenta.' };
    }

    // Transacción: upsert del canal + marcar código usado.
    const reVinculado = await this.prisma.$transaction(async (tx) => {
      const existente = await tx.canalEmpleado.findFirst({
        where: { empleadoId, tipoCanal },
      });
      let reLink = false;
      if (existente) {
        reLink = existente.identificador !== identificadorCanal;
        await tx.canalEmpleado.update({
          where: { id: existente.id },
          data: { identificador: identificadorCanal, verificado: true },
        });
      } else {
        await tx.canalEmpleado.create({
          data: { empleadoId, tipoCanal, identificador: identificadorCanal, verificado: true },
        });
      }
      await tx.codigoVinculacion.update({
        where: { id: cod.id },
        data: { usedAt: new Date() },
      });
      return reLink;
    });

    const empleado = await this.prisma.empleado.findUnique({ where: { id: empleadoId } });
    const nombre = empleado ? `${empleado.nombre} ${empleado.apellido}` : `Empleado ${empleadoId}`;
    this.logger.log(
      `Canal ${tipoCanal} vinculado a empleado ${empleadoId} (reVinculado=${reVinculado})`,
    );
    return { ok: true, empleadoNombreCompleto: nombre, reVinculado };
  }

  /** true si el empleado tiene un canal TELEGRAM verificado. */
  async telegramVinculado(empleadoId: bigint | null): Promise<boolean> {
    if (empleadoId == null) return false;
    const canal = await this.prisma.canalEmpleado.findFirst({
      where: { empleadoId, tipoCanal: TipoCanal.TELEGRAM, verificado: true },
    });
    return !!canal;
  }
}
