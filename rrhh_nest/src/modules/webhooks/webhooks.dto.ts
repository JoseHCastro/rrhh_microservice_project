import {
  IsBase64,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TipoCanal } from '../canales/canal.enums';

/**
 * Payload que n8n empuja cuando un empleado envía una justificación
 * por su canal externo (Telegram/WhatsApp).
 */
export class WebhookJustificacionDto {
  /** Tipo de canal por el que llegó el mensaje. */
  @IsEnum(TipoCanal)
  tipoCanal!: TipoCanal;

  /** chat_id de Telegram, número WhatsApp, email, etc. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  identificadorCanal!: string;

  /** Texto que envió el empleado. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  mensaje?: string;

  /** Si hay adjunto, viene como base64 (data URI o crudo). */
  @IsOptional()
  @IsString()
  archivoBase64?: string;

  /** Nombre original del archivo (para preservar extensión y MIME). */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  filename?: string;

  /** content-type detectado por n8n. */
  @IsOptional()
  @IsString()
  @MaxLength(150)
  contentType?: string;
}

export interface WebhookJustificacionResponse {
  ok: boolean;
  justificacionId: string;
  archivoId: string | null;
  empleadoNombreCompleto: string;
  jefeUsername: string | null;
  mensaje: string;
  /** Análisis de IA (sugerencias, no decisión). `analizado=false` si no se usó IA. */
  ia: {
    analizado: boolean;
    /** Motivo si la IA no analizó (adjunto inválido, error de Gemini, etc.). */
    error: string | null;
    recomendacion: string | null;
    confianza: number | null;
    resumen: string | null;
    diagnosticoDeclarado: string | null;
    documentoValido: boolean | null;
    diasReposo: number | null;
  };
  /** URLs de la página de confirmación (para los botones del correo). */
  urlAprobar: string;
  urlRechazar: string;
}
