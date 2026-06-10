import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** Lo que la IA entendió (sin ejecutar todavía). */
export interface ReporteInterpretacion {
  reporte: string | null;
  parametros: Record<string, any>;
  explicacion: string;
}

/** Resultado uniforme de cualquier reporte. */
export interface ReporteResultado {
  reporte: string;
  columnas: string[];
  filas: Record<string, any>[];
  agregados: Record<string, any>;
  generadoEn: string;
}

interface GqlResp<T> {
  data: T;
  errors?: { message: string }[];
}

/**
 * Servicio de Reportes (Módulo 3 / NestJS). Igual que BitacoraService, habla con
 * el Nest en environment.nestUrl (no con Spring Boot). El AuthInterceptor adjunta
 * el JWT; los endpoints exigen rol ADMIN (REPORTES_GENERAR) — validado en backend.
 */
@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly endpoint = environment.nestUrl + environment.graphqlPath;

  constructor(private http: HttpClient) {}

  /** Capa 2: la IA interpreta el prompt y devuelve qué reporte+parámetros, SIN ejecutar. */
  interpretar(prompt: string): Observable<ReporteInterpretacion> {
    const query = `query ($prompt: String!) {
      interpretarReporte(prompt: $prompt) { reporte parametros explicacion }
    }`;
    return this.post<{ interpretarReporte: ReporteInterpretacion }>(query, { prompt }).pipe(
      map((d) => d.interpretarReporte),
    );
  }

  /** Capa 1: ejecuta el reporte con los parámetros (confirmados o manuales). */
  ejecutar(tipo: string, parametros: Record<string, any>): Observable<ReporteResultado> {
    const query = `query ($tipo: ReporteTipo!, $parametros: ReporteParametrosInput) {
      ejecutarReporte(tipo: $tipo, parametros: $parametros) {
        reporte columnas filas agregados generadoEn
      }
    }`;
    return this.post<{ ejecutarReporte: ReporteResultado }>(query, { tipo, parametros }).pipe(
      map((d) => d.ejecutarReporte),
    );
  }

  /** Capa 2: resumen IA sobre AGREGADOS (sin datos personales). */
  resumir(reporte: string, agregados: any): Observable<string> {
    const query = `query ($reporte: String!, $agregados: JSON!) {
      resumirReporte(reporte: $reporte, agregados: $agregados)
    }`;
    return this.post<{ resumirReporte: string }>(query, { reporte, agregados }).pipe(
      map((d) => d.resumirReporte),
    );
  }

  private post<T>(query: string, variables: Record<string, unknown>): Observable<T> {
    return this.http.post<GqlResp<T>>(this.endpoint, { query, variables }).pipe(
      map((res) => {
        if (res.errors?.length) {
          throw new Error(res.errors.map((e) => e.message).join(' | '));
        }
        return res.data;
      }),
    );
  }
}
