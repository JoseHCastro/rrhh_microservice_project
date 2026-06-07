/**
 * Contrato de análisis de IA para justificaciones de ausencia.
 *
 * IMPORTANTE (encuadre): el resultado son SUGERENCIAS para el supervisor, no un
 * veredicto. `diagnostico` es "lo que el certificado declara", no un diagnóstico
 * emitido por la IA. La decisión final siempre es del humano.
 */
export interface AnalisisJustificacion {
  /** ¿El documento parece un certificado/constancia médica legítima? */
  esCertificadoMedico: boolean;
  documentoValido: boolean;
  /** Tipo de ausencia sugerido (LICENCIA_MEDICA, PERMISO_PERSONAL, etc.). */
  tipoSugerido: string | null;
  /** Días de reposo que el documento declara, si los menciona. */
  diasReposo: number | null;
  /** Resumen de lo que el certificado DECLARA (no diagnóstico de la IA). */
  diagnosticoDeclarado: string | null;
  /** Resumen breve para el supervisor. */
  resumenParaSupervisor: string;
  /** Sugerencia: APROBAR | REVISAR | RECHAZAR (no es decisión). */
  recomendacion: 'APROBAR' | 'REVISAR' | 'RECHAZAR';
  /** Confianza 0..1 de la propia IA sobre su análisis. */
  confianza: number;
}

export interface ParamsAnalisis {
  /** Texto que envió el empleado por el canal. */
  mensaje?: string | null;
  /** Documento adjunto (si hay): binario + tipo. */
  archivo?: { buffer: Buffer; contentType: string } | null;
}

/**
 * Resultado del análisis. NUNCA es null silencioso: si falla, `error` trae el
 * motivo (HTTP de Gemini, adjunto inválido, etc.) para registrarlo.
 * `analisis` y `error` son mutuamente excluyentes; ambos null = IA desactivada.
 */
export interface ResultadoAnalisis {
  analisis: AnalisisJustificacion | null;
  error: string | null;
}

/**
 * Proveedor intercambiable de IA. Hoy: Gemini. Para la entrega final se puede
 * implementar AzureOpenAiProvider sin tocar el flujo (entrega "Azure-pura").
 */
export interface IaAnalisisProvider {
  readonly nombre: string;
  analizar(params: ParamsAnalisis): Promise<ResultadoAnalisis>;
}

export const IA_PROVIDER = Symbol('IA_PROVIDER');
