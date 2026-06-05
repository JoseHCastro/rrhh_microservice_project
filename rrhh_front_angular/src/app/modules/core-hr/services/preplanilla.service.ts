import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../../../_metronic/shared/services/graphql.service';
import { Preplanilla } from '../models/rrhh.models';

@Injectable({ providedIn: 'root' })
export class PreplanillaService {
  constructor(private gql: GraphqlService) {}

  getPreplanillas(empleadoId?: string | null, periodo?: string | null): Observable<Preplanilla[]> {
    return this.gql
      .query<{ preplanillas: Preplanilla[] }>(
        `query ($empleadoId: ID, $periodo: String) {
          preplanillas(empleadoId: $empleadoId, periodo: $periodo) {
            id periodo diasTrabajados faltas retrasos horasExtra s3KeyUri
            empleado { id nombreCompleto }
          }
        }`,
        { empleadoId: empleadoId ?? null, periodo: periodo ?? null }
      )
      .pipe(map((d) => d.preplanillas));
  }

  generar(empleadoId: string, periodo: string): Observable<Preplanilla> {
    return this.gql
      .mutate<{ generarPreplanilla: Preplanilla }>(
        `mutation ($empleadoId: ID!, $periodo: String!) {
          generarPreplanilla(empleadoId: $empleadoId, periodo: $periodo) {
            id periodo diasTrabajados faltas retrasos horasExtra
          }
        }`,
        { empleadoId, periodo }
      )
      .pipe(map((d) => d.generarPreplanilla));
  }
}
