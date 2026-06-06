import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePrivilege } from '../../auth/decorators/require-privilege.decorator';
import type { AuthenticatedUser } from '../../auth/types';
import { PrivilegioType } from '../privilegios/privilegio.type';
import { GrupoType, UsuarioMiembroGrupoType } from './grupo.type';
import {
  ActualizarGrupoInput,
  CrearGrupoInput,
} from './grupo.input';
import { GruposService } from './grupos.service';

@Resolver(() => GrupoType)
export class GruposResolver {
  constructor(private readonly service: GruposService) {}

  // ─── Queries ───────────────────────────────────────────────
  @Query(() => [GrupoType], { name: 'grupos' })
  @RequirePrivilege('GRUPO_GESTIONAR')
  grupos(
    @Args('soloActivos', { nullable: true, defaultValue: false }) soloActivos: boolean,
  ) {
    return this.service.findAll(soloActivos);
  }

  @Query(() => GrupoType, { name: 'grupo', nullable: true })
  @RequirePrivilege('GRUPO_GESTIONAR')
  grupo(@Args('id', { type: () => GraphQLBigInt }) id: bigint) {
    return this.service.findById(id);
  }

  @Query(() => [String], {
    name: 'misPrivilegios',
    description: 'Privilegios del usuario autenticado (computados desde sus grupos).',
  })
  misPrivilegios(@CurrentUser() user: AuthenticatedUser): string[] {
    return user.privilegios;
  }

  @Query(() => [UsuarioMiembroGrupoType], { name: 'usuariosDelGrupo' })
  @RequirePrivilege('GRUPO_ASIGNAR_USUARIOS')
  usuariosDelGrupo(
    @Args('grupoId', { type: () => GraphQLBigInt }) grupoId: bigint,
  ) {
    return this.service.usuariosDelGrupo(grupoId);
  }

  // ─── Mutations ─────────────────────────────────────────────
  @Mutation(() => GrupoType, { name: 'crearGrupo' })
  @RequirePrivilege('GRUPO_GESTIONAR')
  crearGrupo(@Args('input') input: CrearGrupoInput) {
    return this.service.crear(input);
  }

  @Mutation(() => GrupoType, { name: 'actualizarGrupo' })
  @RequirePrivilege('GRUPO_GESTIONAR')
  actualizarGrupo(
    @Args('id', { type: () => GraphQLBigInt }) id: bigint,
    @Args('input') input: ActualizarGrupoInput,
  ) {
    return this.service.actualizar(id, input);
  }

  @Mutation(() => Boolean, { name: 'eliminarGrupo' })
  @RequirePrivilege('GRUPO_GESTIONAR')
  eliminarGrupo(@Args('id', { type: () => GraphQLBigInt }) id: bigint) {
    return this.service.eliminar(id);
  }

  @Mutation(() => GrupoType, { name: 'asignarPrivilegioAGrupo' })
  @RequirePrivilege('GRUPO_GESTIONAR')
  asignarPrivilegioAGrupo(
    @Args('grupoId', { type: () => GraphQLBigInt }) grupoId: bigint,
    @Args('privilegioCodigo') privilegioCodigo: string,
  ) {
    return this.service.asignarPrivilegio(grupoId, privilegioCodigo);
  }

  @Mutation(() => GrupoType, { name: 'revocarPrivilegioDeGrupo' })
  @RequirePrivilege('GRUPO_GESTIONAR')
  revocarPrivilegioDeGrupo(
    @Args('grupoId', { type: () => GraphQLBigInt }) grupoId: bigint,
    @Args('privilegioCodigo') privilegioCodigo: string,
  ) {
    return this.service.revocarPrivilegio(grupoId, privilegioCodigo);
  }

  @Mutation(() => GrupoType, { name: 'asignarUsuarioAGrupo' })
  @RequirePrivilege('GRUPO_ASIGNAR_USUARIOS')
  asignarUsuarioAGrupo(
    @Args('usuarioId', { type: () => GraphQLBigInt }) usuarioId: bigint,
    @Args('grupoId', { type: () => GraphQLBigInt }) grupoId: bigint,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.service.asignarUsuario(usuarioId, grupoId, actor.id);
  }

  @Mutation(() => Boolean, { name: 'removerUsuarioDeGrupo' })
  @RequirePrivilege('GRUPO_ASIGNAR_USUARIOS')
  removerUsuarioDeGrupo(
    @Args('usuarioId', { type: () => GraphQLBigInt }) usuarioId: bigint,
    @Args('grupoId', { type: () => GraphQLBigInt }) grupoId: bigint,
  ) {
    return this.service.removerUsuario(usuarioId, grupoId);
  }

  // ─── Field Resolvers ───────────────────────────────────────
  @ResolveField('privilegios', () => [PrivilegioType])
  resolvePrivilegios(@Parent() grupo: GrupoType) {
    return this.service.privilegiosDelGrupo(grupo.id);
  }

  @ResolveField('totalUsuarios', () => Number)
  resolveTotalUsuarios(@Parent() grupo: GrupoType) {
    return this.service.countUsuarios(grupo.id);
  }
}
