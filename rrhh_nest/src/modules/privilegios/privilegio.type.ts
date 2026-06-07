import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt, GraphQLDateTime } from 'graphql-scalars';

@ObjectType('Privilegio')
export class PrivilegioType {
  @Field(() => GraphQLBigInt)
  id!: bigint;

  @Field()
  codigo!: string;

  @Field()
  nombre!: string;

  @Field(() => String, { nullable: true })
  descripcion?: string | null;

  @Field()
  modulo!: string;

  @Field(() => GraphQLDateTime)
  createdAt!: Date;
}
