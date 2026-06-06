import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ClientIp } from '../../auth/decorators/client-ip.decorator';
import { RequirePrivilege } from '../../auth/decorators/require-privilege.decorator';
import type { AuthenticatedUser } from '../../auth/types';
import {
  ConfirmarSubidaArchivoInput,
  FiltrosArchivoInput,
  IniciarSubidaArchivoInput,
} from './archivo.input';
import { ArchivoPage, ArchivoType, UrlSubidaArchivoType } from './archivo.type';
import { ArchivosService } from './archivos.service';

@Resolver(() => ArchivoType)
export class ArchivosResolver {
  constructor(private readonly service: ArchivosService) {}

  // ─── Queries ───────────────────────────────────────────────
  @Query(() => ArchivoPage, { name: 'archivos' })
  archivos(@Args('filtros', { nullable: true }) filtros?: FiltrosArchivoInput) {
    return this.service.listar(filtros ?? {});
  }

  @Query(() => ArchivoType, { name: 'archivo' })
  async archivo(
    @Args('id', { type: () => GraphQLBigInt }) id: bigint,
    @CurrentUser() user: AuthenticatedUser,
    @ClientIp() ip: string | null,
  ) {
    const archivo = await this.service.findById(id);
    await this.service.asegurarLectura(user, archivo, ip);
    return archivo;
  }

  @Query(() => String, {
    name: 'urlDescargaArchivo',
    description:
      'Genera una presigned URL de descarga (S3) y registra el acceso en bitácora.',
  })
  async urlDescargaArchivo(
    @Args('id', { type: () => GraphQLBigInt }) id: bigint,
    @CurrentUser() user: AuthenticatedUser,
    @ClientIp() ip: string | null,
  ): Promise<string> {
    const { url } = await this.service.urlDescarga(id, user, ip);
    return url;
  }

  // ─── Mutations ─────────────────────────────────────────────
  @Mutation(() => UrlSubidaArchivoType, { name: 'iniciarSubidaArchivo' })
  @RequirePrivilege('ARCHIVO_SUBIR')
  iniciarSubidaArchivo(
    @Args('input') input: IniciarSubidaArchivoInput,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.iniciarSubida(input, user.id);
  }

  @Mutation(() => ArchivoType, { name: 'confirmarSubidaArchivo' })
  @RequirePrivilege('ARCHIVO_SUBIR')
  confirmarSubidaArchivo(
    @Args('input') input: ConfirmarSubidaArchivoInput,
    @CurrentUser() user: AuthenticatedUser,
    @ClientIp() ip: string | null,
  ) {
    return this.service.confirmarSubida(input, user, ip);
  }

  @Mutation(() => Boolean, { name: 'eliminarArchivo' })
  @RequirePrivilege('ARCHIVO_ELIMINAR')
  eliminarArchivo(
    @Args('id', { type: () => GraphQLBigInt }) id: bigint,
    @CurrentUser() user: AuthenticatedUser,
    @ClientIp() ip: string | null,
    @Args('borrarDeS3', { nullable: true, defaultValue: false }) borrarDeS3: boolean,
  ) {
    return this.service.eliminar(id, user, ip, borrarDeS3);
  }
}
