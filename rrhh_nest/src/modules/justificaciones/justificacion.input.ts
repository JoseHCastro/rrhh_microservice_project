import { Field, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoJustificacion } from './justificacion.enums';

@InputType()
export class FiltrosJustificacionInput {
  @Field(() => EstadoJustificacion, { nullable: true })
  @IsOptional()
  @IsEnum(EstadoJustificacion)
  estado?: EstadoJustificacion;

  @Field(() => GraphQLBigInt, { nullable: true })
  @IsOptional()
  empleadoId?: bigint;

  @Field(() => GraphQLBigInt, { nullable: true })
  @IsOptional()
  jefeUsuarioId?: bigint;
}

@InputType()
export class ResolverJustificacionInput {
  @Field(() => GraphQLBigInt)
  id!: bigint;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;
}
