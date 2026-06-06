import { Field, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

@InputType()
export class CrearGrupoInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @Field(() => [String], {
    nullable: true,
    description: 'Códigos de privilegios a asignar inicialmente al grupo',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  privilegioCodigos?: string[];
}

@InputType()
export class ActualizarGrupoInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

@InputType()
export class AsignarUsuarioAGrupoInput {
  @Field(() => GraphQLBigInt)
  usuarioId!: bigint;

  @Field(() => GraphQLBigInt)
  grupoId!: bigint;
}
