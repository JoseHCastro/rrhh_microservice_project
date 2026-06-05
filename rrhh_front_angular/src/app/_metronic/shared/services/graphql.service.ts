import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface GraphqlResponse<T> {
  data: T;
  errors?: { message: string }[];
}

/**
 * Transporte GraphQL genérico (infraestructura, sin lógica de negocio).
 * Hace POST a {apiUrl}{graphqlPath} y desempaqueta data/errors.
 * Los servicios de dominio (EmpleadoService, etc.) lo usan para sus queries.
 */
@Injectable({ providedIn: 'root' })
export class GraphqlService {
  private readonly endpoint = environment.apiUrl + environment.graphqlPath;

  constructor(private http: HttpClient) {}

  query<T>(query: string, variables: Record<string, unknown> = {}): Observable<T> {
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

  /** Alias semántico para mutaciones (mismo transporte). */
  mutate<T>(mutation: string, variables: Record<string, unknown> = {}): Observable<T> {
    return this.query<T>(mutation, variables);
  }
}
