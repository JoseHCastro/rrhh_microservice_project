import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AnalisisJustificacion,
  IaAnalisisProvider,
  ParamsAnalisis,
  ResultadoAnalisis,
} from './ia.types';

/**
 * Provider de IA basado en Google Gemini (Google AI Studio).
 * Multimodal: puede leer el PDF/imagen del certificado directamente.
 *
 * Privacidad / datos de salud: este provider envía el documento a Google.
 * Para la entrega final se recomienda mover a Azure OpenAI (tenant propio).
 * Requiere consentimiento del empleado (documentado en el informe).
 *
 * Si no hay GEMINI_API_KEY, `analizar` devuelve null y el flujo continúa sin IA.
 */
@Injectable()
export class GeminiProvider implements IaAnalisisProvider {
  readonly nombre = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('GEMINI_API_KEY') ?? '';
    this.model = config.get<string>('GEMINI_MODEL') ?? 'gemini-2.0-flash';
  }

  async analizar(params: ParamsAnalisis): Promise<ResultadoAnalisis> {
    if (!this.apiKey) {
      return { analisis: null, error: 'GEMINI_API_KEY no configurada' };
    }

    const partes: unknown[] = [{ text: this.prompt(params.mensaje) }];
    if (params.archivo) {
      partes.push({
        inline_data: {
          mime_type: params.archivo.contentType,
          data: params.archivo.buffer.toString('base64'),
        },
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: partes }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
        }),
      });
      if (!resp.ok) {
        const cuerpo = await resp.text();
        const motivo = this.extraerMensaje(cuerpo);
        this.logger.error(`Gemini HTTP ${resp.status}: ${cuerpo}`);
        return { analisis: null, error: `Gemini HTTP ${resp.status}: ${motivo}` };
      }
      const json: any = await resp.json();
      const texto: string =
        json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const analisis = this.parsear(texto);
      if (!analisis) {
        return { analisis: null, error: 'No se pudo parsear la respuesta de Gemini' };
      }
      return { analisis, error: null };
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      this.logger.error(`Error llamando a Gemini: ${msg}`);
      return { analisis: null, error: `Error de red llamando a Gemini: ${msg}` };
    }
  }

  private extraerMensaje(cuerpo: string): string {
    try {
      const o = JSON.parse(cuerpo);
      return o?.error?.message ?? cuerpo.slice(0, 200);
    } catch {
      return cuerpo.slice(0, 200);
    }
  }

  private prompt(mensaje?: string | null): string {
    return [
      'Eres un asistente de RRHH que ayuda a un supervisor a revisar una',
      'justificación de ausencia. Analiza el mensaje del empleado y, si se adjunta,',
      'el documento (posible certificado médico). NO emitas un diagnóstico propio:',
      'solo reporta lo que el documento DECLARA. Tu salida es una SUGERENCIA, la',
      'decisión final la toma el supervisor.',
      '',
      `Mensaje del empleado: "${mensaje ?? ''}"`,
      '',
      'Responde EXCLUSIVAMENTE un JSON con esta forma exacta:',
      '{',
      '  "esCertificadoMedico": boolean,',
      '  "documentoValido": boolean,',
      '  "tipoSugerido": string|null,            // ej "LICENCIA_MEDICA"',
      '  "diasReposo": number|null,',
      '  "diagnosticoDeclarado": string|null,    // lo que el documento DECLARA',
      '  "resumenParaSupervisor": string,        // 1-2 frases',
      '  "recomendacion": "APROBAR"|"REVISAR"|"RECHAZAR",',
      '  "confianza": number                     // 0..1',
      '}',
    ].join('\n');
  }

  private parsear(texto: string): AnalisisJustificacion | null {
    try {
      const limpio = texto.replace(/```json/gi, '').replace(/```/g, '').trim();
      const o = JSON.parse(limpio);
      const rec = ['APROBAR', 'REVISAR', 'RECHAZAR'].includes(o.recomendacion)
        ? o.recomendacion
        : 'REVISAR';
      return {
        esCertificadoMedico: !!o.esCertificadoMedico,
        documentoValido: !!o.documentoValido,
        tipoSugerido: o.tipoSugerido ?? null,
        diasReposo: typeof o.diasReposo === 'number' ? o.diasReposo : null,
        diagnosticoDeclarado: o.diagnosticoDeclarado ?? null,
        resumenParaSupervisor: o.resumenParaSupervisor ?? 'Sin resumen.',
        recomendacion: rec,
        confianza: typeof o.confianza === 'number' ? o.confianza : 0,
      };
    } catch (err) {
      this.logger.error(`No se pudo parsear la respuesta de Gemini: ${err}`);
      return null;
    }
  }
}
