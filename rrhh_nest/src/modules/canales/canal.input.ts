import { Field, InputType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { TipoCanal } from './canal.enums';

@InputType()
export class RegistrarCanalEmpleadoInput {
  @Field(() => GraphQLBigInt)
  empleadoId!: bigint;

  @Field(() => TipoCanal)
  @IsEnum(TipoCanal)
  tipoCanal!: TipoCanal;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  identificador!: string;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  verificado?: boolean;
}
