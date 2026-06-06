import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

/**
 * Perfil del usuario/empleado logueado (lo consume la app móvil).
 * `telegramVinculado` decide si la app muestra el botón "Vincular Telegram".
 */
@ObjectType('MiPerfil')
export class MiPerfilType {
  @Field(() => GraphQLBigInt, { nullable: true })
  empleadoId?: bigint | null;

  @Field()
  username!: string;

  @Field()
  telegramVinculado!: boolean;
}
