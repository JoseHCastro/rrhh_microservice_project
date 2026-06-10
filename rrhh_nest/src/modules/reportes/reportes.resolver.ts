import { Args, Query, Resolver } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';
import { RequirePrivilege } from '../../auth/decorators/require-privilege.decorator';
import { ReportesService } from './reportes.service';
import { ReportesIaService } from './reportes-ia.service';
import {
  ReporteInterpretacion,
  ReporteParametrosInput,
  ReporteResultado,
  ReporteTipo,
} from './reportes.types';

/**
 * Reportes del Módulo 3. Acceso solo ADMIN vía @RequirePrivilege (admin pasa por
 * bypass ROLE_ADMIN; el privilegio queda listo para abrir a no-admins en el futuro).
 *
 * - Capa 1: ejecutarReporte (consultas controladas).
 * - Capa 2 (IA): interpretarReporte (function calling, sin ejecutar) y resumirReporte.
 */
@Resolver()
export class ReportesResolver {
  constructor(
    private readonly service: ReportesService,
    private readonly ia: ReportesIaService,
  ) {}

  // ── Capa 1 ──
  @Query(() => ReporteResultado, {
    name: 'ejecutarReporte',
    description: 'Ejecuta uno de los 4 reportes administrativos (solo ADMIN / REPORTES_GENERAR).',
  })
  @RequirePrivilege('REPORTES_GENERAR')
  ejecutarReporte(
    @Args('tipo', { type: () => ReporteTipo }) tipo: ReporteTipo,
    @Args('parametros', { type: () => ReporteParametrosInput, nullable: true })
    parametros?: ReporteParametrosInput,
  ): Promise<ReporteResultado> {
    return this.service.ejecutar(tipo, parametros);
  }

  // ── Capa 2 (IA) ──
  @Query(() => ReporteInterpretacion, {
    name: 'interpretarReporte',
    description:
      'La IA (Gemini, function calling) interpreta el prompt y devuelve qué reporte y parámetros eligió, SIN ejecutarlo (para confirmación previa).',
  })
  @RequirePrivilege('REPORTES_GENERAR')
  interpretarReporte(@Args('prompt') prompt: string): Promise<ReporteInterpretacion> {
    return this.ia.interpretar(prompt);
  }

  @Query(() => String, {
    name: 'resumirReporte',
    description:
      'La IA redacta un párrafo de resumen a partir de los AGREGADOS del reporte (sin datos personales).',
  })
  @RequirePrivilege('REPORTES_GENERAR')
  resumirReporte(
    @Args('reporte') reporte: string,
    @Args('agregados', { type: () => GraphQLJSON }) agregados: unknown,
  ): Promise<string> {
    return this.ia.resumir(reporte, agregados);
  }
}
