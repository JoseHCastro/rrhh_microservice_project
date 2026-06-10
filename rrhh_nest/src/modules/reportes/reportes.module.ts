import { Module } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { ReportesIaService } from './reportes-ia.service';
import { ReportesResolver } from './reportes.resolver';

/**
 * Módulo de Reportes.
 * - Capa 1: ReportesService (consultas controladas).
 * - Capa 2: ReportesIaService (Gemini function calling), reutiliza la config de
 *   IA por ConfigService sin tocar el IaService/GeminiProvider de justificaciones.
 *
 * PrismaModule y BitacoraModule son @Global → sus servicios se inyectan sin
 * importarlos aquí. No toca archivos/justificaciones (solo consume BitacoraService).
 */
@Module({
  providers: [ReportesService, ReportesIaService, ReportesResolver],
})
export class ReportesModule {}
