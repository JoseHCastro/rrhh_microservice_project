import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt, GraphQLDateTime } from 'graphql-scalars';
import { PrivilegioType } from '../privilegios/privilegio.type';

@ObjectType('Grupo')
export class GrupoType {
  @Field(() => GraphQLBigInt)
  id!: bigint;

  @Field()
  nombre!: string;

  @Field(() => String, { nullable: true })
  descripcion?: string | null;

  @Field()
  activo!: boolean;

  @Field(() => GraphQLDateTime)
  createdAt!: Date;

  // Resuelto por FieldResolver
  @Field(() => [PrivilegioType])
  privilegios!: PrivilegioType[];

  // Conteo de usuarios asignados (FieldResolver)
  @Field()
  totalUsuarios!: number;
}

/**
 * Mini-tipo para listar usuarios miembros de un grupo.
 * No expone toda la entidad Usuario (que pertenece a Spring Boot).
 */
@ObjectType('UsuarioMiembroGrupo')
export class UsuarioMiembroGrupoType {
  @Field(() => GraphQLBigInt)
  usuarioId!: bigint;

  @Field()
  username!: string;

  @Field(() => GraphQLDateTime)
  asignadoAt!: Date;

  @Field(() => GraphQLBigInt, { nullable: true })
  asignadoPorId?: bigint | null;
}
