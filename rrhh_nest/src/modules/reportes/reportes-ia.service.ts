import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReporteInterpretacion, ReporteTipo } from './reportes.types';

/**
 * Capa 2 — IA (conveniencia sobre la capa 1).
 *
 * Reutiliza la CONFIG de Gemini (GEMINI_API_KEY / GEMINI_MODEL) pero NO toca el
 * IaService/GeminiProvider de justificaciones (que usa structured output). Aquí
 * usamos *function calling*: Gemini elige uno de los 4 reportes y sus parámetros.
 *
 * Privacidad: a Gemini SOLO se le envía el prompt del usuario + las descripciones
 * de los reportes (interpretar), o datos AGREGADOS sin PII (resumir). Nunca filas.
 */
@Injectable()
export class ReportesIaService {
  private readonly logger = new Logger(ReportesIaService.name);
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: ConfigService) {
    this.apiKey = config.get<string>('GEMINI_API_KEY') ?? '';
    this.model = config.get<string>('GEMINI_MODEL') ?? 'gemini-2.0-flash';
  }

  // ─────────────────────────── interpretar (function calling) ───────────────────────────
  async interpretar(prompt: string): Promise<ReporteInterpretacion> {
    if (!this.apiKey || this.apiKey.length < 20) {
      return { reporte: null, parametros: {}, explicacion: 'IA no configurada (falta GEMINI_API_KEY).' };
    }

    const hoy = new Date().toISOString().slice(0, 10);
    const body = {
      system_instruction: {
        parts: [
          {
            text: [
              'Eres un asistente que traduce una petición en lenguaje natural a UNO de los',
              'reportes administrativos disponibles. DEBES llamar exactamente una función.',
              `Hoy es ${hoy}. Para fechas relativas ("abril", "el mes pasado", "esta semana")`,
              'usa el año actual salvo que el usuario indique otro. No inventes IDs. Si el',
              'usuario menciona un departamento por nombre (ej. "comercial", "ventas"), pon ese',
              'texto TAL CUAL en departamentoNombre (no inventes departamentoId).',
            ].join(' '),
          },
        ],
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ function_declarations: FUNCIONES }],
      tool_config: { function_calling_config: { mode: 'ANY' } },
    };

    let json: any;
    try {
      json = await this.callGemini(body);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      this.logger.error(`interpretar() Gemini falló: ${msg}`);
      // Degradación con gracia: el front tiene el modo manual (dropdown) como respaldo.
      return {
        reporte: null,
        parametros: {},
        explicacion:
          'La IA no está disponible en este momento (servicio saturado). ' +
          'Usa el modo manual para elegir el reporte directamente.',
      };
    }

    const parts: any[] = json?.candidates?.[0]?.content?.parts ?? [];
    const fc = parts.find((p) => p?.functionCall)?.functionCall;
    if (!fc?.name) {
      return {
        reporte: null,
        parametros: {},
        explicacion: 'La IA no pudo asociar tu petición a ninguno de los reportes disponibles.',
      };
    }

    const tipo = NOMBRE_A_TIPO[fc.name];
    if (!tipo) {
      return { reporte: null, parametros: {}, explicacion: `La IA eligió una función desconocida (${fc.name}).` };
    }

    const parametros = (fc.args ?? {}) as Record<string, unknown>;
    return { reporte: tipo, parametros, explicacion: this.explicar(tipo, parametros) };
  }

  // ─────────────────────────── resumir (texto sobre agregados) ───────────────────────────
  async resumir(reporte: string, agregados: unknown): Promise<string> {
    if (!this.apiKey || this.apiKey.length < 20) {
      return '(Resumen IA no disponible: falta GEMINI_API_KEY.)';
    }

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                'Eres analista de RRHH. Redacta en español un párrafo BREVE (2 a 4 frases)',
                'que resuma el siguiente reporte a partir de datos AGREGADOS (conteos y',
                'distribuciones; NO hay datos personales). No inventes cifras que no estén',
                'en los datos. Sé claro y profesional.',
                '',
                `Reporte: ${LABELS[reporte] ?? reporte}`,
                `Datos agregados (JSON): ${JSON.stringify(agregados)}`,
              ].join('\n'),
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.3 },
    };

    try {
      const json = await this.callGemini(body);
      const texto: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return texto.trim() || '(La IA no devolvió un resumen.)';
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      this.logger.error(`resumir() Gemini falló: ${msg}`);
      // El resumen es opcional: degradar a texto neutro, sin detalle técnico.
      return 'Resumen no disponible en este momento.';
    }
  }

  // ─────────────────────────── infra ───────────────────────────
  /**
   * Llama a Gemini con reintento automático ante sobrecarga (503 / 429).
   * Backoff exponencial: 1s, 2s, 4s (hasta 3 reintentos). Los errores de lógica
   * (otros 4xx) NO se reintentan: fallan de inmediato.
   */
  private async callGemini(body: unknown): Promise<any> {
    const ESPERAS = [1000, 2000, 4000]; // ms entre reintentos
    let ultimoError: any;

    for (let intento = 0; intento <= ESPERAS.length; intento++) {
      try {
        return await this.fetchGemini(body);
      } catch (err: any) {
        ultimoError = err;
        const status: number | undefined = err?.status;
        const reintentable = status === 503 || status === 429;
        if (!reintentable || intento === ESPERAS.length) {
          throw err;
        }
        const espera = ESPERAS[intento];
        this.logger.warn(
          `Gemini ${status} (sobrecarga). Reintento ${intento + 1}/${ESPERAS.length} en ${espera}ms…`,
        );
        await this.dormir(espera);
      }
    }
    throw ultimoError;
  }

  private async fetchGemini(body: unknown): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const cuerpo = await resp.text();
      let motivo = cuerpo.slice(0, 200);
      try {
        motivo = JSON.parse(cuerpo)?.error?.message ?? motivo;
      } catch {
        /* texto plano */
      }
      const error: any = new Error(`Gemini HTTP ${resp.status}: ${motivo}`);
      error.status = resp.status; // para que callGemini decida si reintentar
      throw error;
    }
    return resp.json();
  }

  private dormir(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private explicar(tipo: ReporteTipo, params: Record<string, unknown>): string {
    const entradas = Object.entries(params).filter(([, v]) => v != null && v !== '');
    const detalle =
      entradas.length > 0
        ? `con ${entradas.map(([k, v]) => `${k}=${String(v)}`).join(', ')}`
        : 'sin filtros';
    return `Entendí: «${LABELS[tipo]}» ${detalle}. Revisa y confirma para generar el reporte.`;
  }
}

const LABELS: Record<string, string> = {
  EMPLEADOS_POR_DEPARTAMENTO: 'Empleados por departamento',
  ASISTENCIA_POR_PERIODO: 'Asistencia por período',
  JUSTIFICACIONES_POR_ESTADO: 'Justificaciones por estado',
  ACCESOS_ARCHIVOS: 'Accesos a archivos (bitácora)',
};

const NOMBRE_A_TIPO: Record<string, ReporteTipo> = {
  reporte_empleados_por_departamento: ReporteTipo.EMPLEADOS_POR_DEPARTAMENTO,
  reporte_asistencia_por_periodo: ReporteTipo.ASISTENCIA_POR_PERIODO,
  reporte_justificaciones_por_estado: ReporteTipo.JUSTIFICACIONES_POR_ESTADO,
  reporte_accesos_archivos: ReporteTipo.ACCESOS_ARCHIVOS,
};

/**
 * Function declarations que se le describen a Gemini. SOLO nombres y parámetros
 * de los reportes — ningún dato real de la base. Los nombres de parámetros
 * coinciden con ReporteParametrosInput para pasar el resultado directo a
 * ejecutarReporte sin remapear.
 */
const FUNCIONES = [
  {
    name: 'reporte_empleados_por_departamento',
    description:
      'Lista de empleados con su departamento, cargo y estado. Úsalo para "empleados por departamento", "personal de la empresa", "cuántos empleados hay".',
    parameters: {
      type: 'object',
      properties: {
        departamentoId: {
          type: 'integer',
          description: 'ID numérico del departamento, solo si el usuario da un número.',
        },
        departamentoNombre: {
          type: 'string',
          description: 'Nombre (o parte) del departamento tal como lo escribió el usuario, ej. "comercial". El backend lo resuelve.',
        },
      },
    },
  },
  {
    name: 'reporte_asistencia_por_periodo',
    description:
      'Marcaciones de asistencia (entradas/salidas) en un rango de fechas. Úsalo para "asistencia de abril", "marcaciones de la semana pasada".',
    parameters: {
      type: 'object',
      properties: {
        desde: { type: 'string', description: 'Fecha inicio YYYY-MM-DD (usa el año actual para fechas relativas).' },
        hasta: { type: 'string', description: 'Fecha fin YYYY-MM-DD.' },
        empleadoId: { type: 'integer', description: 'ID numérico de empleado si se especifica uno.' },
      },
    },
  },
  {
    name: 'reporte_justificaciones_por_estado',
    description:
      'Justificaciones de ausencia filtradas por estado y/o fechas. Úsalo para "justificaciones pendientes", "ausencias rechazadas de marzo".',
    parameters: {
      type: 'object',
      properties: {
        estado: { type: 'string', enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA'] },
        desde: { type: 'string', description: 'Fecha inicio YYYY-MM-DD.' },
        hasta: { type: 'string', description: 'Fecha fin YYYY-MM-DD.' },
      },
    },
  },
  {
    name: 'reporte_accesos_archivos',
    description:
      'Auditoría de accesos a archivos (bitácora). Filtra por usuario O por archivo (uno de los dos). Úsalo para "quién accedió al archivo 5", "accesos del usuario 9".',
    parameters: {
      type: 'object',
      properties: {
        usuarioId: { type: 'integer', description: 'ID numérico de usuario.' },
        archivoId: { type: 'integer', description: 'ID numérico de archivo.' },
        desde: { type: 'string', description: 'Fecha/hora inicio ISO.' },
        hasta: { type: 'string', description: 'Fecha/hora fin ISO.' },
      },
    },
  },
];
