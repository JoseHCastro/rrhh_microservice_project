import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RequirePrivilege } from '../../auth/decorators/require-privilege.decorator';
import { PrivilegioType } from './privilegio.type';
import { ActualizarPrivilegioInput, CrearPrivilegioInput } from './privilegio.input';
import { PrivilegiosService } from './privilegios.service';

@Resolver(() => PrivilegioType)
export class PrivilegiosResolver {
  constructor(private readonly service: PrivilegiosService) {}

  // ─── Queries ───────────────────────────────────────────────
  @Query(() => [PrivilegioType], { name: 'privilegios' })
  @RequirePrivilege('PRIVILEGIO_GESTIONAR')
  privilegios(@Args('modulo', { nullable: true }) modulo?: string) {
    return this.service.findAll(modulo);
  }

  @Query(() => PrivilegioType, { name: 'privilegio', nullable: true })
  @RequirePrivilege('PRIVILEGIO_GESTIONAR')
  privilegio(@Args('id', { type: () => GraphQLBigInt }) id: bigint) {
    return this.service.findById(id);
  }

  // ─── Mutations ─────────────────────────────────────────────
  @Mutation(() => PrivilegioType, { name: 'crearPrivilegio' })
  @Roles('ROLE_ADMIN')
  crearPrivilegio(@Args('input') input: CrearPrivilegioInput) {
    return this.service.crear(input);
  }

  @Mutation(() => PrivilegioType, { name: 'actualizarPrivilegio' })
  @Roles('ROLE_ADMIN')
  actualizarPrivilegio(
    @Args('id', { type: () => GraphQLBigInt }) id: bigint,
    @Args('input') input: ActualizarPrivilegioInput,
  ) {
    return this.service.actualizar(id, input);
  }

  @Mutation(() => Boolean, { name: 'eliminarPrivilegio' })
  @Roles('ROLE_ADMIN')
  eliminarPrivilegio(@Args('id', { type: () => GraphQLBigInt }) id: bigint) {
    return this.service.eliminar(id);
  }
}
