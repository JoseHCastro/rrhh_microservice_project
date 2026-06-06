import { Module } from '@nestjs/common';
import { CanalesModule } from '../canales/canales.module';
import { JustificacionesResolver } from './justificaciones.resolver';
import { JustificacionesService } from './justificaciones.service';
import { AprobacionService } from './aprobacion.service';
import { AprobacionController } from './aprobacion.controller';

@Module({
  imports: [CanalesModule],
  controllers: [AprobacionController],
  providers: [JustificacionesService, JustificacionesResolver, AprobacionService],
  exports: [JustificacionesService, AprobacionService],
})
export class JustificacionesModule {}
