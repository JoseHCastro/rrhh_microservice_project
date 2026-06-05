import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../../../_metronic/shared/services/graphql.service';
import {
  Empleado,
  EmpleadoInput,
  EmpleadoPage,
  EstadoEmpleado,
  Preplanilla,
  RegistroAsistencia,
  SolicitudAusencia,
} from '../models/rrhh.models';

// Fragmento completo. El backend (app11) ya serializa horaEntrada/horaSalida
// (scalar LocalTime) y resuelve los anidados también en empleado(id).
const EMPLEADO_FIELDS = `
  id nombre apellido nombreCompleto estado fechaContratacion
  horaEntrada horaSalida telefono carnetIdentidad
  departamento { id nombre } cargo { id nombre salarioPorHora }
  supervisor { id nombreCompleto }
`;

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  constructor(private gql: GraphqlService) {}

  getPage(
    page = 0,
    size = 20,
    estado?: EstadoEmpleado | null,
    departamentoId?: string | null
  ): Observable<EmpleadoPage> {
    return this.gql
      .query<{ empleados: EmpleadoPage }>(
        `query ($page: Int, $size: Int, $estado: EstadoEmpleado, $departamentoId: ID) {
          empleados(page: $page, size: $size, estado: $estado, departamentoId: $departamentoId) {
            content { ${EMPLEADO_FIELDS} }
            pageInfo { totalElements totalPages currentPage pageSize hasNext }
          }
        }`,
        { page, size, estado: estado ?? null, departamentoId: departamentoId ?? null }
      )
      .pipe(map((d) => d.empleados));
  }

  getById(id: string): Observable<Empleado> {
    return this.gql
      .query<{ empleado: Empleado }>(
        `query ($id: ID!) { empleado(id: $id) { ${EMPLEADO_FIELDS} } }`,
        { id }
      )
      .pipe(map((d) => d.empleado));
  }

  create(input: EmpleadoInput): Observable<Empleado> {
    return this.gql
      .mutate<{ crearEmpleado: Empleado }>(
        `mutation ($input: EmpleadoInput!) { crearEmpleado(input: $input) { ${EMPLEADO_FIELDS} } }`,
        { input }
      )
      .pipe(map((d) => d.crearEmpleado));
  }

  update(id: string, input: EmpleadoInput): Observable<Empleado> {
    return this.gql
      .mutate<{ actualizarEmpleado: Empleado }>(
        `mutation ($id: ID!, $input: EmpleadoInput!) { actualizarEmpleado(id: $id, input: $input) { ${EMPLEADO_FIELDS} } }`,
        { id, input }
      )
      .pipe(map((d) => d.actualizarEmpleado));
  }

  deactivate(id: string): Observable<boolean> {
    return this.gql
      .mutate<{ desactivarEmpleado: boolean }>(
        `mutation ($id: ID!) { desactivarEmpleado(id: $id) }`,
        { id }
      )
      .pipe(map((d) => d.desactivarEmpleado));
  }

  // ---- Datos para la vista de detalle ----
  getAsistencia(empleadoId: string, page = 0, size = 10): Observable<RegistroAsistencia[]> {
    return this.gql
      .query<{ registrosAsistencia: { content: RegistroAsistencia[] } }>(
        `query ($empleadoId: ID, $page: Int, $size: Int) {
          registrosAsistencia(empleadoId: $empleadoId, page: $page, size: $size) {
            content { id horaEntrada horaSalida ubicacionGps estado }
          }
        }`,
        { empleadoId, page, size }
      )
      .pipe(map((d) => d.registrosAsistencia.content));
  }

  getPreplanillas(empleadoId: string): Observable<Preplanilla[]> {
    return this.gql
      .query<{ preplanillas: Preplanilla[] }>(
        `query ($empleadoId: ID) {
          preplanillas(empleadoId: $empleadoId) {
            id periodo diasTrabajados faltas retrasos horasExtra s3KeyUri
          }
        }`,
        { empleadoId }
      )
      .pipe(map((d) => d.preplanillas));
  }

  getSolicitudes(empleadoId: string): Observable<SolicitudAusencia[]> {
    return this.gql
      .query<{ solicitudesAusencia: SolicitudAusencia[] }>(
        `query ($empleadoId: ID) {
          solicitudesAusencia(empleadoId: $empleadoId) {
            id fechaInicio fechaFin estado tipoAusencia { id nombre }
          }
        }`,
        { empleadoId }
      )
      .pipe(map((d) => d.solicitudesAusencia));
  }
}
