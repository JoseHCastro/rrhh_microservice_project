import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt, GraphQLDateTime } from 'graphql-scalars';
import { TipoCanal } from '../canales/canal.enums';
import { EstadoJustificacion } from './justificacion.enums';

@ObjectType('JustificacionAusencia')
export class JustificacionAusenciaType {
  @Field(() => GraphQLBigInt)
  id!: bigint;

  @Field(() => GraphQLBigInt)
  empleadoId!: bigint;

  @Field(() => TipoCanal)
  tipoCanal!: TipoCanal;

  @Field()
  identificadorCanal!: string;

  @Field(() => String, { nullable: true })
  mensajeOriginal?: string | null;

  @Field(() => GraphQLBigInt, { nullable: true })
  archivoId?: bigint | null;

  @Field(() => EstadoJustificacion)
  estado!: EstadoJustificacion;

  @Field(() => GraphQLBigInt, { nullable: true })
  jefeUsuarioId?: bigint | null;

  @Field(() => String, { nullable: true })
  comentarioJefe?: string | null;

  @Field(() => GraphQLDateTime)
  createdAt!: Date;

  @Field(() => GraphQLDateTime, { nullable: true })
  resolvedAt?: Date | null;

  // ── Análisis de IA (sugerencias para el supervisor, no veredicto) ──
  @Field(() => Boolean)
  iaAnalizado!: boolean;

  @Field(() => Boolean, { nullable: true })
  documentoValidoIa?: boolean | null;

  @Field(() => String, { nullable: true })
  tipoSugeridoIa?: string | null;

  @Field(() => Int, { nullable: true })
  diasReposoIa?: number | null;

  @Field(() => String, { nullable: true })
  diagnosticoIa?: string | null;

  @Field(() => String, { nullable: true })
  resumenIa?: string | null;

  @Field(() => String, { nullable: true })
  recomendacionIa?: string | null;

  @Field(() => Float, { nullable: true })
  confianzaIa?: number | null;

  @Field(() => String, { nullable: true })
  iaError?: string | null;
}
