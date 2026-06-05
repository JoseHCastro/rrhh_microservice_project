import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../../../_metronic/shared/services/graphql.service';
import { EstadoSistema, RegistroAsistenciaPage, SistemaConfig } from '../models/rrhh.models';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  constructor(private gql: GraphqlService) {}

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

  enrolarRostro(empleadoId: string, codigoFacial: string): Observable<{ id: string; codigoFacial: string; fechaRegistro: string }> {
    return this.gql
      .mutate<{ enrolarRostro: { id: string; codigoFacial: string; fechaRegistro: string } }>(
        `mutation ($empleadoId: ID!, $codigoFacial: String!) {
          enrolarRostro(empleadoId: $empleadoId, codigoFacial: $codigoFacial) { id codigoFacial fechaRegistro }
        }`,
        { empleadoId, codigoFacial }
      )
      .pipe(map((d) => d.enrolarRostro));
  }
}
