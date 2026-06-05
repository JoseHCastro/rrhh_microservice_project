import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GraphqlService } from '../../_metronic/shared/services/graphql.service';

export interface DashboardData {
  empleados: { content: { id: string; estado: string; departamento: { id: string; nombre: string } }[]; pageInfo: { totalElements: number } };
  departamentos: { id: string; nombre: string }[];
  cargos: { id: string }[];
  solicitudesAusencia: { id: string }[];
  sistemaConfigEstado: { estado: string } | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private gql: GraphqlService) {}

  load(): Observable<DashboardData> {
    return this.gql.query<DashboardData>(`
      query {
        empleados(page: 0, size: 500) {
          content { id estado departamento { id nombre } }
          pageInfo { totalElements }
        }
        departamentos { id nombre }
        cargos { id }
        solicitudesAusencia(estado: PENDIENTE) { id }
        sistemaConfigEstado { estado }
      }
    `);
  }
}
