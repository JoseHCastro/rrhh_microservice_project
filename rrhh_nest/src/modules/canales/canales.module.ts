import { Module } from '@nestjs/common';
import { CanalesResolver } from './canales.resolver';
import { CanalesService } from './canales.service';
import { VinculacionService } from './vinculacion.service';
import { VinculacionController } from './vinculacion.controller';
import { WebhookSecretGuard } from '../webhooks/webhook-secret.guard';

@Module({
  controllers: [VinculacionController],
  providers: [CanalesService, CanalesResolver, VinculacionService, WebhookSecretGuard],
  exports: [CanalesService, VinculacionService],
})
export class CanalesModule {}
