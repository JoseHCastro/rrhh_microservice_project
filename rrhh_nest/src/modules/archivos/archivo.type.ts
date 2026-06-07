import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt, GraphQLDateTime } from 'graphql-scalars';
import { CategoriaArchivo, EstadoArchivo } from './archivo.enums';

@ObjectType('Archivo')
export class ArchivoType {
  @Field(() => GraphQLBigInt)
  id!: bigint;

  @Field()
  nombre!: string;

  @Field(() => String, { nullable: true })
  descripcion?: string | null;

  @Field(() => CategoriaArchivo)
  categoria!: CategoriaArchivo;

  @Field()
  s3Key!: string;

  @Field()
  contentType!: string;

  @Field(() => GraphQLBigInt, { nullable: true })
  tamanioBytes?: bigint | null;

  @Field(() => String, { nullable: true })
  hashSha256?: string | null;

  @Field(() => GraphQLBigInt, { nullable: true })
  empleadoId?: bigint | null;

  @Field(() => String, { nullable: true })
  privilegioLecturaCodigo?: string | null;

  @Field(() => String, { nullable: true })
  privilegioDescargaCodigo?: string | null;

  @Field(() => GraphQLBigInt)
  subidoPorId!: bigint;

  @Field(() => EstadoArchivo)
  estado!: EstadoArchivo;

  @Field(() => GraphQLDateTime)
  createdAt!: Date;
}

@ObjectType('ArchivoPageInfo')
export class ArchivoPageInfo {
  @Field(() => Int) totalElements!: number;
  @Field(() => Int) totalPages!: number;
  @Field(() => Int) currentPage!: number;
  @Field(() => Int) pageSize!: number;
  @Field() hasNext!: boolean;
}

@ObjectType('ArchivoPage')
export class ArchivoPage {
  @Field(() => [ArchivoType])
  content!: ArchivoType[];

  @Field(() => ArchivoPageInfo)
  pageInfo!: ArchivoPageInfo;
}

/**
 * Respuesta de `iniciarSubidaArchivo`. Cliente sube el binario DIRECTO a S3
 * usando la presigned URL, luego confirma con `confirmarSubidaArchivo`.
 */
@ObjectType('UrlSubidaArchivo')
export class UrlSubidaArchivoType {
  @Field(() => ArchivoType)
  archivo!: ArchivoType;

  @Field()
  presignedUrl!: string;

  @Field(() => Int)
  expiresInSeconds!: number;
}
