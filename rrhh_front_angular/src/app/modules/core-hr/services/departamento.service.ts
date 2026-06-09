import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../../../_metronic/shared/services/graphql.service';
import { Departamento } from '../models/rrhh.models';

@Injectable({ providedIn: 'root' })
export class DepartamentoService {
  constructor(private gql: GraphqlService) {}

  getAll(): Observable<Departamento[]> {
    return this.gql
      .query<{ departamentos: Departamento[] }>(
        `query { departamentos { id nombre ubicacionGps gerente { id nombreCompleto } } }`
      )
      .pipe(map((d) => d.departamentos));
  }

  create(nombre: string, ubicacionGps?: string, gerenteId?: string): Observable<Departamento> {
    return this.gql
      .mutate<{ crearDepartamento: Departamento }>(
        `mutation ($nombre: String!, $ubicacionGps: String, $gerenteId: ID) { crearDepartamento(nombre: $nombre, ubicacionGps: $ubicacionGps, gerenteId: $gerenteId) { id nombre } }`,
        { nombre, ubicacionGps: ubicacionGps ?? null, gerenteId: gerenteId ?? null }
      )
      .pipe(map((d) => d.crearDepartamento));
  }
}
