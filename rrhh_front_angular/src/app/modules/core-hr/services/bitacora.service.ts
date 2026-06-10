import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** Un registro de la bitácora de auditoría (tabla DynamoDB del Módulo 3 / NestJS). */
export interface BitacoraItem {
  timestamp: string; // ISO-8601
  accion: string;
  resultado?: string | null;
  usuarioId: number | string;
  documentoS3Id?: number | string | null;
  ipOrigen?: string | null;
  plataformaOrigen?: string | null;
  documentoS3Url?: string | null;
  motivoDenegacion?: string | null;
}

interface GraphqlResponse<T> {
  data: T;
  errors?: { message: string }[];
}

// Campos solicitados al backend. usuarioId/documentoS3Id son scalar BigInt.
const BITACORA_FIELDS = `
  timestamp accion resultado usuarioId documentoS3Id
  ipOrigen plataformaOrigen documentoS3Url motivoDenegacion
`;

/**
 * Servicio de la Bitácora de Auditoría.
 *
 * A diferencia del resto de servicios del front (que hablan con Spring Boot a
 * través del GraphqlService genérico compartido), la bitácora vive en el
 * microservicio NestJS (Módulo 3), en `environment.nestUrl`. Por eso este
 * servicio hace su PROPIO POST a `{nestUrl}/graphql` y no usa GraphqlService.
 *
 * El AuthInterceptor adjunta el JWT (`auth_token`) a TODA petición saliente, así
 * que el token compartido viaja también a este endpoint — no se añade auth manual.
 * Las queries exigen el privilegio `BITACORA_CONSULTAR` (admin lo tiene por bypass).
 *
 * API puntual por diseño DynamoDB: se consulta por usuario (PK) o por archivo (GSI),
 * no hay listado total.
 */
@Injectable({ providedIn: 'root' })
export class BitacoraService {
  private readonly endpoint = environment.nestUrl + environment.graphqlPath;

  constructor(private http: HttpClient) {}

  /** Eventos de auditoría de un usuario (PK = USER#id). `usuarioId` va como BigInt!. */
  porUsuario(usuarioId: number | string, limit = 50): Observable<BitacoraItem[]> {
    const query = `query ($usuarioId: BigInt!, $limit: Float) {
      bitacoraPorUsuario(usuarioId: $usuarioId, limit: $limit) {
        ${BITACORA_FIELDS}
      }
    }`;
    return this.post<{ bitacoraPorUsuario: BitacoraItem[] }>(query, {
      usuarioId: String(usuarioId),
      limit,
    }).pipe(map((d) => d.bitacoraPorUsuario));
  }

  /** Eventos de auditoría de un archivo (GSI1 = DOC#id). `archivoId` va como BigInt!. */
  porArchivo(archivoId: number | string, limit = 50): Observable<BitacoraItem[]> {
    const query = `query ($archivoId: BigInt!, $limit: Float) {
      bitacoraPorArchivo(archivoId: $archivoId, limit: $limit) {
        ${BITACORA_FIELDS}
      }
    }`;
    return this.post<{ bitacoraPorArchivo: BitacoraItem[] }>(query, {
      archivoId: String(archivoId),
      limit,
    }).pipe(map((d) => d.bitacoraPorArchivo));
  }

  private post<T>(query: string, variables: Record<string, unknown>): Observable<T> {
    return this.http
      .post<GraphqlResponse<T>>(this.endpoint, { query, variables })
      .pipe(
        map((res) => {
          if (res.errors?.length) {
            throw new Error(res.errors.map((e) => e.message).join(' | '));
          }
          return res.data;
        })
      );
  }
}
