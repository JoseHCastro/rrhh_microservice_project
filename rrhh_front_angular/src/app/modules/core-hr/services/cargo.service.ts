import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../../../_metronic/shared/services/graphql.service';
import { Cargo } from '../models/rrhh.models';

@Injectable({ providedIn: 'root' })
export class CargoService {
  constructor(private gql: GraphqlService) {}

  getAll(): Observable<Cargo[]> {
    return this.gql
      .query<{ cargos: Cargo[] }>(`query { cargos { id nombre salarioPorHora } }`)
      .pipe(map((d) => d.cargos));
  }
}
