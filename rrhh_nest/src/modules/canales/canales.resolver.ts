import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePrivilege } from '../../auth/decorators/require-privilege.decorator';
import type { AuthenticatedUser } from '../../auth/types';
import { CanalEmpleadoType } from './canal.type';
import { MiPerfilType } from './perfil.type';
import { RegistrarCanalEmpleadoInput } from './canal.input';
import { CanalesService } from './canales.service';
import { VinculacionService } from './vinculacion.service';

@Resolver(() => CanalEmpleadoType)
export class CanalesResolver {
  constructor(
    private readonly service: CanalesService,
    private readonly vinculacion: VinculacionService,
  ) {}

  /**
   * Perfil del usuario logueado (JWT). La app usa `telegramVinculado` para
   * mostrar/ocultar el botón "Vincular Telegram".
   */
  @Query(() => MiPerfilType, { name: 'miPerfil' })
  async miPerfil(@CurrentUser() user: AuthenticatedUser): Promise<MiPerfilType> {
    return {
      empleadoId: user.empleadoId,
      username: user.username,
      telegramVinculado: await this.vinculacion.telegramVinculado(user.empleadoId),
    };
  }

  @Query(() => [CanalEmpleadoType], { name: 'canalesDeEmpleado' })
  @RequirePrivilege('CANAL_EMPLEADO_GESTIONAR')
  canalesDeEmpleado(
    @Args('empleadoId', { type: () => GraphQLBigInt }) empleadoId: bigint,
  ) {
    return this.service.findByEmpleado(empleadoId);
  }

  @Mutation(() => CanalEmpleadoType, { name: 'registrarCanalEmpleado' })
  @RequirePrivilege('CANAL_EMPLEADO_GESTIONAR')
  registrarCanalEmpleado(@Args('input') input: RegistrarCanalEmpleadoInput) {
    return this.service.registrar(input);
  }

  @Mutation(() => CanalEmpleadoType, { name: 'verificarCanalEmpleado' })
  @RequirePrivilege('CANAL_EMPLEADO_GESTIONAR')
  verificarCanalEmpleado(
    @Args('id', { type: () => GraphQLBigInt }) id: bigint,
  ) {
    return this.service.verificar(id);
  }

  @Mutation(() => Boolean, { name: 'eliminarCanalEmpleado' })
  @RequirePrivilege('CANAL_EMPLEADO_GESTIONAR')
  eliminarCanalEmpleado(@Args('id', { type: () => GraphQLBigInt }) id: bigint) {
    return this.service.eliminar(id);
  }
}
