import { Module } from '@nestjs/common';
import { CanalesModule } from '../canales/canales.module';
import { JustificacionesModule } from '../justificaciones/justificaciones.module';
import { WebhookSecretGuard } from './webhook-secret.guard';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [CanalesModule, JustificacionesModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookSecretGuard],
})
export class WebhooksModule {}
