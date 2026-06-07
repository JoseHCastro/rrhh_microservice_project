import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GraphqlService } from '../../../_metronic/shared/services/graphql.service';
import { EstadoSistema, RegistroAsistenciaPage, SistemaConfig } from '../models/rrhh.models';

import { environment } from '../../../../environments/environment';

const FASTAPI_GQL = environment.fastapiGql;

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  constructor(private gql: GraphqlService, private http: HttpClient) {}

  getRegistros(empleadoId?: string | null, page = 0, size = 15): Observable<RegistroAsistenciaPage> {
    return this.gql
      .query<{ registrosAsistencia: RegistroAsistenciaPage }>(
        `query ($empleadoId: ID, $page: Int, $size: Int) {
          registrosAsistencia(empleadoId: $empleadoId, page: $page, size: $size) {
            content {
              id horaEntrada horaSalida ubicacionGps estado estadoPlanilla
              empleado { id nombreCompleto }
            }
            pageInfo { totalElements totalPages currentPage pageSize hasNext }
          }
        }`,
        { empleadoId: empleadoId ?? null, page, size }
      )
      .pipe(map((d) => d.registrosAsistencia));
  }

  getSistema(): Observable<SistemaConfig | null> {
    return this.gql
      .query<{ sistemaConfigEstado: SistemaConfig | null }>(
        `query { sistemaConfigEstado { id estado fechaHoraEstado } }`
      )
      .pipe(map((d) => d.sistemaConfigEstado));
  }

  cambiarEstado(estado: EstadoSistema): Observable<SistemaConfig> {
    return this.gql
      .mutate<{ cambiarEstadoSistema: SistemaConfig }>(
        `mutation ($estado: EstadoSistema!) { cambiarEstadoSistema(estado: $estado) { id estado fechaHoraEstado } }`,
        { estado }
      )
      .pipe(map((d) => d.cambiarEstadoSistema));
  }

  /**
   * Envía el descriptor facial (array de 128 floats en JSON) a FastAPI (puerto 8001)
   * para guardarlo en la tabla reconocimiento_facial.
   */
  enrolarRostro(empleadoId: string, fotoBase64: string): Observable<{ success: boolean; message: string }> {
    const body = {
      query: `mutation ($empleadoId: Int!, $fotoBase64: String!) {
        enrolarRostro(empleadoId: $empleadoId, fotoBase64: $fotoBase64) {
          success
          message
          reconocimiento { id fechaRegistro }
        }
      }`,
      variables: { empleadoId: parseInt(empleadoId, 10), fotoBase64 }
    };
    return this.http.post<any>(FASTAPI_GQL, body).pipe(
      map((res) => {
        if (res.errors) throw new Error(res.errors[0].message);
        return res.data.enrolarRostro;
      })
    );
  }

  /**
   * Consulta si un empleado ya tiene un rostro enrolado activo en FastAPI.
   */
  verificarEnrolamiento(empleadoId: string): Observable<{ id: number; fechaRegistro: string } | null> {
    const body = {
      query: `query ($empleadoId: Int!) {
        reconocimientoFacial(empleadoId: $empleadoId) { id fechaRegistro activo }
      }`,
      variables: { empleadoId: parseInt(empleadoId, 10) }
    };
    return this.http.post<any>(FASTAPI_GQL, body).pipe(
      map((res) => res.data?.reconocimientoFacial ?? null)
    );
  }
}
