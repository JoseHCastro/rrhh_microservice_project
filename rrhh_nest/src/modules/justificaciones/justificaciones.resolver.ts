import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePrivilege } from '../../auth/decorators/require-privilege.decorator';
import type { AuthenticatedUser } from '../../auth/types';
import {
  FiltrosJustificacionInput,
  ResolverJustificacionInput,
} from './justificacion.input';
import { JustificacionAusenciaType } from './justificacion.type';
import { JustificacionesService } from './justificaciones.service';

@Resolver(() => JustificacionAusenciaType)
export class JustificacionesResolver {
  constructor(private readonly service: JustificacionesService) {}

  @Query(() => [JustificacionAusenciaType], { name: 'justificacionesAusencia' })
  @RequirePrivilege('JUSTIFICACION_VER_TODAS')
  justificaciones(
    @Args('filtros', { nullable: true }) filtros?: FiltrosJustificacionInput,
  ) {
    return this.service.findAll(filtros ?? {});
  }

  @Query(() => JustificacionAusenciaType, { name: 'justificacionAusencia' })
  @RequirePrivilege('JUSTIFICACION_VER_TODAS')
  detalle(@Args('id', { type: () => GraphQLBigInt }) id: bigint) {
    return this.service.findById(id);
  }

  @Mutation(() => JustificacionAusenciaType, { name: 'aprobarJustificacionAusencia' })
  @RequirePrivilege('JUSTIFICACION_APROBAR')
  aprobar(
    @Args('input') input: ResolverJustificacionInput,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.service.aprobar(input, actor.id);
  }

  @Mutation(() => JustificacionAusenciaType, { name: 'rechazarJustificacionAusencia' })
  @RequirePrivilege('JUSTIFICACION_APROBAR')
  rechazar(
    @Args('input') input: ResolverJustificacionInput,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.service.rechazar(input, actor.id);
  }
}
