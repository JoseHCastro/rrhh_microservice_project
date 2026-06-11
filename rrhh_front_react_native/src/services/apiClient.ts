/**
 * src/services/apiClient.ts
 *
 * Cliente API centralizado. Proporciona:
 * 1. restClient: Peticiones HTTP REST para login/refresh.
 * 2. gql: Consultas GraphQL autenticadas automáticamente con Bearer token.
 */
import { Platform } from 'react-native';
import { sessionStore } from './sessionStore';

export const REST_BASE_URL = 'https://hr-springboot.duckdns.org/api/v1';
export const GRAPHQL_URL = 'https://hr-springboot.duckdns.org/graphql';
export const FASTAPI_GRAPHQL_URL = 'https://hr-fastapi.duckdns.org/graphql';
const REQUEST_TIMEOUT_MS = 15_000;

export class RestError extends Error {
  readonly status: number;
  readonly data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'RestError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(method: string, path: string, body?: any): Promise<T> {
  const url = `${REST_BASE_URL}${path}`;
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const msg = data?.message ?? data?.error ?? `HTTP ${response.status}`;
      throw new RestError(msg, response.status, data);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new RestError('Tiempo de espera agotado.', 408, null);
    }
    throw err;
  }
}

export const restClient = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: any) => request<T>('POST', path, body),
};

// ─── GraphQL Client ──────────────────────────────────────────────────────────

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

export async function gql<T>(
  query: string,
  variables?: Record<string, any>,
): Promise<T> {
  const token = sessionStore.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers,
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
