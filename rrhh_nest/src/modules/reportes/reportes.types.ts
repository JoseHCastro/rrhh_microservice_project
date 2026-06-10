import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GraphQLBigInt, GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';

/** Los 4 reportes disponibles (capa 1). La capa IA solo elige uno de estos. */
export enum ReporteTipo {
  EMPLEADOS_POR_DEPARTAMENTO = 'EMPLEADOS_POR_DEPARTAMENTO',
  ASISTENCIA_POR_PERIODO = 'ASISTENCIA_POR_PERIODO',
  JUSTIFICACIONES_POR_ESTADO = 'JUSTIFICACIONES_POR_ESTADO',
  ACCESOS_ARCHIVOS = 'ACCESOS_ARCHIVOS',
}
registerEnumType(ReporteTipo, {
  name: 'ReporteTipo',
  description: 'Catálogo de reportes administrativos del Módulo 3.',
});

/**
 * Parámetros de TODOS los reportes (todos opcionales). Cada reporte usa el
 * subconjunto que le aplica; el resto se ignora. Un único input simplifica el
 * contrato y encaja con la capa IA (que devuelve `{ tipo, parametros }`).
 */
@InputType()
export class ReporteParametrosInput {
  @Field(() => GraphQLBigInt, { nullable: true, description: 'Empleados por departamento: filtra por ID de depto.' })
  departamentoId?: bigint;

  @Field({ nullable: true, description: 'Empleados por departamento: nombre (o parte) del depto; el backend resuelve flexible (insensible a mayúsculas y parcial). Ignorado si se da departamentoId.' })
  departamentoNombre?: string;

  @Field(() => GraphQLBigInt, { nullable: true, description: 'Asistencia: filtra por empleado.' })
  empleadoId?: bigint;

  @Field(() => GraphQLBigInt, { nullable: true, description: 'Accesos: bitácora por usuario (PK).' })
  usuarioId?: bigint;

  @Field(() => GraphQLBigInt, { nullable: true, description: 'Accesos: bitácora por archivo (GSI).' })
  archivoId?: bigint;

  @Field({ nullable: true, description: 'Justificaciones: PENDIENTE | APROBADA | RECHAZADA.' })
  estado?: string;

  @Field({ nullable: true, description: 'Rango inicio (YYYY-MM-DD o ISO).' })
  desde?: string;

  @Field({ nullable: true, description: 'Rango fin (YYYY-MM-DD o ISO).' })
  hasta?: string;

  @Field(() => Int, { nullable: true, description: 'Accesos: máximo de registros (default 100).' })
  limit?: number;
}

/**
 * Resultado uniforme de cualquier reporte.
 * - `filas`: array de objetos (lo que ve el admin en la tabla; puede tener datos personales).
 * - `agregados`: conteos/distribuciones SIN datos personales (alimenta el resumen IA y los gráficos).
 */
@ObjectType()
export class ReporteResultado {
  @Field()
  reporte!: string;

  @Field(() => [String])
  columnas!: string[];

  @Field(() => GraphQLJSON)
  filas!: unknown;

  @Field(() => GraphQLJSON)
  agregados!: unknown;

  @Field(() => GraphQLDateTime)
  generadoEn!: Date;
}

/** Forma que devuelven los métodos internos por reporte (sin metadatos comunes). */
export interface ReporteParcial {
  columnas: string[];
  filas: Record<string, unknown>[];
  agregados: Record<string, unknown>;
}

/**
 * Lo que la IA (Gemini) entendió del prompt, SIN ejecutar el reporte.
 * Se muestra al admin para que confirme antes de generar (capa 2 → capa 1).
 */
@ObjectType()
export class ReporteInterpretacion {
  @Field(() => String, { nullable: true, description: 'ReporteTipo elegido (null si la IA no pudo decidir).' })
  reporte?: string | null;

  @Field(() => GraphQLJSON, { description: 'Parámetros que la IA extrajo (listos para ejecutarReporte).' })
  parametros!: unknown;

  @Field(() => String, { description: 'Explicación legible de lo que entendió la IA.' })
  explicacion!: string;
}
