import { Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { CategoriaArchivo } from './archivo.enums';

@InputType()
export class IniciarSubidaArchivoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @Field(() => CategoriaArchivo)
  @IsEnum(CategoriaArchivo)
  categoria!: CategoriaArchivo;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  contentType!: string;

  @Field(() => GraphQLBigInt, { nullable: true })
  @IsOptional()
  empleadoId?: bigint;

  @Field({
    nullable: true,
    description:
      'Privilegio requerido para LISTAR/VER este archivo. Si null, basta con estar autenticado.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  privilegioLecturaCodigo?: string;

  @Field({
    nullable: true,
    description:
      'Privilegio requerido para DESCARGAR (obtener URL S3). Si null, basta con estar autenticado.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  privilegioDescargaCodigo?: string;
}

@InputType()
export class ConfirmarSubidaArchivoInput {
  @Field(() => GraphQLBigInt)
  archivoId!: bigint;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(64, 64)
  hashSha256?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  tamanioBytes?: number;
}

@InputType()
export class FiltrosArchivoInput {
  @Field(() => CategoriaArchivo, { nullable: true })
  @IsOptional()
  @IsEnum(CategoriaArchivo)
  categoria?: CategoriaArchivo;

  @Field(() => GraphQLBigInt, { nullable: true })
  @IsOptional()
  empleadoId?: bigint;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  size?: number;
}
