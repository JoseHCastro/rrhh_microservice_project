import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../../../_metronic/shared/services/graphql.service';
import { NombreRol, Usuario } from '../models/rrhh.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private gql: GraphqlService) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.gql
      .query<{ usuarios: Usuario[] }>(
        `query { usuarios { id username activo createdAt roles { rol { id nombre } } } }`
      )
      .pipe(map((d) => d.usuarios));
  }

  activar(id: string): Observable<boolean> {
    return this.gql
      .mutate<{ activarUsuario: boolean }>(`mutation ($id: ID!) { activarUsuario(id: $id) }`, { id })
      .pipe(map((d) => d.activarUsuario));
  }

  desactivar(id: string): Observable<boolean> {
    return this.gql
      .mutate<{ desactivarUsuario: boolean }>(`mutation ($id: ID!) { desactivarUsuario(id: $id) }`, { id })
      .pipe(map((d) => d.desactivarUsuario));
  }

  asignarRol(usuarioId: string, rol: NombreRol): Observable<Usuario> {
    return this.gql
      .mutate<{ asignarRol: Usuario }>(
        `mutation ($usuarioId: ID!, $rol: NombreRol!) {
          asignarRol(usuarioId: $usuarioId, rol: $rol) {
            id username roles { rol { id nombre } }
          }
        }`,
        { usuarioId, rol }
      )
      .pipe(map((d) => d.asignarRol));
  }
}
