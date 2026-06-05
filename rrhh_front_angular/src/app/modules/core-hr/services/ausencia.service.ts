import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../../../_metronic/shared/services/graphql.service';
import { EstadoSolicitud, SolicitudAusencia, TipoAusencia } from '../models/rrhh.models';

@Injectable({ providedIn: 'root' })
export class AusenciaService {
  constructor(private gql: GraphqlService) {}

  getSolicitudes(estado?: EstadoSolicitud | null, empleadoId?: string | null): Observable<SolicitudAusencia[]> {
    return this.gql
      .query<{ solicitudesAusencia: SolicitudAusencia[] }>(
        `query ($estado: EstadoSolicitud, $empleadoId: ID) {
          solicitudesAusencia(estado: $estado, empleadoId: $empleadoId) {
            id fechaInicio fechaFin estado fechaSolicitud
            tipoAusencia { id nombre }
            empleado { id nombreCompleto }
            aprobador { id username }
          }
        }`,
        { estado: estado ?? null, empleadoId: empleadoId ?? null }
      )
      .pipe(map((d) => d.solicitudesAusencia));
  }

  aprobar(id: string): Observable<SolicitudAusencia> {
    return this.gql
      .mutate<{ aprobarSolicitudAusencia: SolicitudAusencia }>(
        `mutation ($id: ID!) { aprobarSolicitudAusencia(id: $id) { id estado } }`,
        { id }
      )
      .pipe(map((d) => d.aprobarSolicitudAusencia));
  }

  rechazar(id: string): Observable<SolicitudAusencia> {
    return this.gql
      .mutate<{ rechazarSolicitudAusencia: SolicitudAusencia }>(
        `mutation ($id: ID!) { rechazarSolicitudAusencia(id: $id) { id estado } }`,
        { id }
      )
      .pipe(map((d) => d.rechazarSolicitudAusencia));
  }

  crear(input: { empleadoId: string; tipoAusenciaId: string; fechaInicio: string; fechaFin: string }): Observable<SolicitudAusencia> {
    return this.gql
      .mutate<{ crearSolicitudAusencia: SolicitudAusencia }>(
        `mutation ($input: SolicitudAusenciaInput!) { crearSolicitudAusencia(input: $input) { id estado } }`,
        { input }
      )
      .pipe(map((d) => d.crearSolicitudAusencia));
  }

  getTipos(): Observable<TipoAusencia[]> {
    return this.gql
      .query<{ tiposAusencia: TipoAusencia[] }>(`query { tiposAusencia { id nombre } }`)
      .pipe(map((d) => d.tiposAusencia));
  }
}
