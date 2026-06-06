import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IA_PROVIDER } from './ia.types';
import type {
  IaAnalisisProvider,
  ParamsAnalisis,
  ResultadoAnalisis,
} from './ia.types';

/**
 * Fachada de análisis de IA. El resto del sistema depende de ESTA clase,
 * no del provider concreto (Gemini hoy, Azure OpenAI mañana).
 *
 * - Opt-in: si IA_ANALISIS_HABILITADO != 'true', no analiza (sin error).
 * - Falla VISIBLE: si el provider falla o el adjunto es inválido, devuelve
 *   `error` con el motivo (no null silencioso). El caller lo persiste.
 */
@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private readonly habilitado: boolean;
  private static readonly MIN_BYTES = 100;

  constructor(
    config: ConfigService,
    @Inject(IA_PROVIDER) private readonly provider: IaAnalisisProvider,
  ) {
    this.habilitado = config.get<string>('IA_ANALISIS_HABILITADO') === 'true';
  }

  get activo(): boolean {
    return this.habilitado;
  }

  async analizar(params: ParamsAnalisis): Promise<ResultadoAnalisis> {
    if (!this.habilitado) return { analisis: null, error: null };

    // Validar el adjunto ANTES de gastar una llamada a la IA.
    if (params.archivo) {
      const motivo = this.validarAdjunto(params.archivo.buffer, params.archivo.contentType);
      if (motivo) {
        this.logger.warn(`Adjunto inválido para IA: ${motivo}`);
        return { analisis: null, error: motivo };
      }
    }

    const r = await this.provider.analizar(params);
    if (r.analisis) {
      this.logger.log(
        `IA(${this.provider.nombre}): recomendación=${r.analisis.recomendacion} confianza=${r.analisis.confianza}`,
      );
    } else if (r.error) {
      this.logger.error(`IA(${this.provider.nombre}) sin resultado: ${r.error}`);
    }
    return r;
  }

  /**
   * Verifica que los bytes correspondan a un PDF/imagen real (magic bytes) y
   * tengan tamaño razonable. Devuelve el motivo si es inválido, o null si OK.
   * Esto atrapa adjuntos corruptos/vacíos (ej. el caso de 9 bytes de n8n).
   */
  private validarAdjunto(buffer: Buffer, contentType: string): string | null {
    if (buffer.length < IaService.MIN_BYTES) {
      return `El adjunto es demasiado pequeño o está vacío (${buffer.length} bytes) — posible captura incorrecta.`;
    }
    const ct = (contentType || '').toLowerCase();
    const esPdf = buffer.subarray(0, 4).toString('latin1') === '%PDF';
    const esJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const esPng =
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

    if (ct.includes('pdf') && !esPdf) {
      return 'El contentType dice PDF pero los bytes no son un PDF válido (no empieza con %PDF).';
    }
    if (ct.includes('jpeg') && !esJpg) {
      return 'El contentType dice JPEG pero los bytes no son un JPEG válido.';
    }
    if (ct.includes('png') && !esPng) {
      return 'El contentType dice PNG pero los bytes no son un PNG válido.';
    }
    if (!esPdf && !esJpg && !esPng) {
      return `El adjunto no es un PDF/JPEG/PNG reconocible (contentType=${contentType}).`;
    }
    return null;
  }
}
