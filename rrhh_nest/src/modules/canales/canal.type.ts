import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt, GraphQLDateTime } from 'graphql-scalars';
import { TipoCanal } from './canal.enums';

@ObjectType('CanalEmpleado')
export class CanalEmpleadoType {
  @Field(() => GraphQLBigInt)
  id!: bigint;

  @Field(() => GraphQLBigInt)
  empleadoId!: bigint;

  @Field(() => TipoCanal)
  tipoCanal!: TipoCanal;

  @Field()
  identificador!: string;

  @Field()
  verificado!: boolean;

  @Field(() => GraphQLDateTime)
  createdAt!: Date;
}
