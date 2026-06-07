import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

/**
 * Item de bitácora tal como vive en DynamoDB.
 *
 * Schema oficial (Documentacion Contexto/gemini-code-*.html):
 *   PK     = USER#<usuario_id>
 *   SK     = <ISO_ts>#<uuid>
 *   GSI1PK = DOC#<documento_s3_id>
 *   GSI1SK = <ISO_ts>
 *   Attrs  = usuario_id, documento_s3_id, accion, ip_origen, ttl
 */
@ObjectType('BitacoraItem')
export class BitacoraItemType {
  @Field()
  pk!: string;

  @Field()
  sk!: string;

  @Field(() => GraphQLBigInt)
  usuarioId!: bigint;

  @Field(() => GraphQLBigInt, { nullable: true })
  documentoS3Id?: bigint | null;

  // String (no enum): la tabla es compartida; otros módulos pueden usar otro
  // vocabulario de acción. Exponerlo como texto evita romper la consulta.
  @Field(() => String)
  accion!: string;

  @Field(() => String, { nullable: true })
  resultado?: string | null;

  @Field(() => String, { nullable: true })
  ipOrigen?: string | null;

  @Field(() => String, { nullable: true })
  plataformaOrigen?: string | null;

  @Field(() => String, { nullable: true })
  documentoS3Url?: string | null;

  @Field(() => String, { nullable: true })
  userAgent?: string | null;

  @Field()
  timestamp!: string; // ISO-8601

  @Field(() => String, { nullable: true })
  motivoDenegacion?: string | null;
}
