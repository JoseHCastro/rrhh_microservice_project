import { Args, Query, Resolver } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { RequirePrivilege } from '../../auth/decorators/require-privilege.decorator';
import { BitacoraService } from './bitacora.service';
import { BitacoraItemType } from './bitacora.type';

@Resolver()
export class BitacoraResolver {
  constructor(private readonly service: BitacoraService) {}

  @Query(() => [BitacoraItemType], {
    name: 'bitacoraPorUsuario',
    description:
      'Eventos de auditoría de un usuario (query por PK = USER#id). Ordenado más reciente primero.',
  })
  @RequirePrivilege('BITACORA_CONSULTAR')
  bitacoraPorUsuario(
    @Args('usuarioId', { type: () => GraphQLBigInt }) usuarioId: bigint,
    @Args('desde', { nullable: true }) desde?: string,
    @Args('hasta', { nullable: true }) hasta?: string,
    @Args('limit', { nullable: true, defaultValue: 50 }) limit?: number,
  ) {
    return this.service.queryPorUsuario(usuarioId, desde, hasta, limit ?? 50);
  }

  @Query(() => [BitacoraItemType], {
    name: 'bitacoraPorArchivo',
    description:
      'Eventos de auditoría de un archivo (query por GSI1 = DOC#id). Quién accedió, cuándo.',
  })
  @RequirePrivilege('BITACORA_CONSULTAR')
  bitacoraPorArchivo(
    @Args('archivoId', { type: () => GraphQLBigInt }) archivoId: bigint,
    @Args('desde', { nullable: true }) desde?: string,
    @Args('hasta', { nullable: true }) hasta?: string,
    @Args('limit', { nullable: true, defaultValue: 50 }) limit?: number,
  ) {
    return this.service.queryPorArchivo(archivoId, desde, hasta, limit ?? 50);
  }
}
