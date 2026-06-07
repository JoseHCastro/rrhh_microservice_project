/**
 * src/services/telegramVinculacionService.ts
 *
 * Cliente del Módulo 3 (Seguridad / Automatización) — microservicio NestJS en :3000.
 *
 * OJO: el resto de la app apunta a :8080 (Módulo 2, Spring Boot). Estos endpoints
 * viven en otro microservicio (:3000), pero el JWT es COMPARTIDO entre ambos, así que
 * reutilizamos el mismo `sessionStore.getToken()` para el Bearer.
 *
 * Expone 3 funciones para la pantalla "Vincular Telegram":
 *   1. getMiPerfil()              → ¿ya está vinculado? (decide si mostrar el botón)
 *   2. generarCodigoVinculacion() → pide un código de un solo uso (vive 5 min)
 *   3. abrirBotConCodigo(codigo)  → abre Telegram con deep link ?start=<codigo>
 */
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { sessionStore } from './sessionStore';

// ─── Configuración ─────────────────────────────────────────────────────────────
// Mismo patrón de host que apiClient.ts: el emulador Android no resuelve "localhost".
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const NEST_BASE = `http://${HOST}:3000`;
const NEST_GRAPHQL_URL = `${NEST_BASE}/graphql`;
const REQUEST_TIMEOUT_MS = 15_000;

/** Username del bot de Telegram (sin @). El backend resuelve el código en /confirmar. */
const TELEGRAM_BOT_USERNAME = 'rrhh_justificaciones_bot';

// ─── Tipos expuestos ───────────────────────────────────────────────────────────

export interface MiPerfil {
  empleadoId: number | null;
  username: string;
  telegramVinculado: boolean;
}

export interface CodigoVinculacion {
  codigo: string;
  expiraEnSegundos: number;
}

// ─── Helpers internos (mismo estilo de manejo de error que apiClient.ts) ─────────

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

function authHeaders(): Record<string, string> {
  const token = sessionStore.getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/** GraphQL contra :3000 (no podemos reutilizar gql() de apiClient porque apunta a :8080). */
async function nestGql<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(NEST_GRAPHQL_URL, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} — ${response.statusText}`);
    }

    const json: GraphQLResponse<T> = await response.json();

    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors.map((e) => e.message).join(' | '));
    }

    if (json.data === undefined) {
      throw new Error('La respuesta GraphQL no contiene el campo "data".');
    }

    return json.data;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado.');
    }
    throw err;
  }
}

/** POST REST contra :3000. Lanza Error con mensaje legible (igual que RestError). */
async function nestPost<T>(path: string, body?: any): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${NEST_BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const msg =
        (data && (data.message ?? data.error)) ?? `HTTP ${response.status}`;
      throw new Error(Array.isArray(msg) ? msg.join(' | ') : String(msg));
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado.');
    }
    throw err;
  }
}

// ─── Queries / mutations ─────────────────────────────────────────────────────────

const MI_PERFIL_QUERY = `
  query MiPerfil {
    miPerfil {
      empleadoId
      username
      telegramVinculado
    }
  }
`;

interface MiPerfilResponse {
  miPerfil: {
    empleadoId: number | string | null;
    username: string;
    telegramVinculado: boolean;
  };
}

// ─── API pública del service ─────────────────────────────────────────────────────

/**
 * Perfil del empleado logueado en el Módulo 3. Úsalo para decidir si muestras
 * el botón "Vincular Telegram" (cuando telegramVinculado === false).
 */
export async function getMiPerfil(): Promise<MiPerfil> {
  const data = await nestGql<MiPerfilResponse>(MI_PERFIL_QUERY);
  const p = data.miPerfil;
  // empleadoId llega como BigInt serializado (string) o number según el scalar.
  const empleadoId =
    p.empleadoId === null || p.empleadoId === undefined
      ? null
      : Number(p.empleadoId);

  return {
    empleadoId: Number.isNaN(empleadoId as number) ? null : empleadoId,
    username: p.username,
    telegramVinculado: p.telegramVinculado,
  };
}

/**
 * Pide al backend un código de un solo uso para vincular Telegram.
 * El código vive `expiraEnSegundos` (300 = 5 min). El empleadoId NO se manda:
 * el backend lo toma del JWT.
 */
export async function generarCodigoVinculacion(): Promise<CodigoVinculacion> {
  return nestPost<CodigoVinculacion>(
    '/api/v3/canales/vinculacion/generar',
    { tipoCanal: 'TELEGRAM' },
  );
}

/**
 * Abre la app de Telegram (o el navegador) en el bot, con el código pre-cargado
 * como parámetro `start`. Al pulsar "Iniciar" en Telegram, el bot dispara el
 * webhook que confirma la vinculación en el backend.
 */
export async function abrirBotConCodigo(codigo: string): Promise<void> {
  const url = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${encodeURIComponent(codigo)}`;
  const soportado = await Linking.canOpenURL(url);
  if (!soportado) {
    throw new Error('No se pudo abrir Telegram en este dispositivo.');
  }
  await Linking.openURL(url);
}
