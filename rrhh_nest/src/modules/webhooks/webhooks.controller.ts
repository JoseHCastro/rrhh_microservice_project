import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { WebhookSecretGuard } from './webhook-secret.guard';
import {
  WebhookJustificacionDto,
  WebhookJustificacionResponse,
} from './webhooks.dto';
import { WebhooksService } from './webhooks.service';

@Controller('api/v3/webhooks')
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}

  /**
   * Ping de salud. n8n lo usa para confirmar conectividad sin gastar payload.
   * Público (sin secret) — solo retorna OK.
   */
  @Public()
  @Get('health')
  health() {
    return { ok: true, modulo: 'modulo3-rrhh-nest', timestamp: new Date().toISOString() };
  }

  /**
   * Recibe una justificación de ausencia desde n8n.
   * Protegido por el secret compartido (header X-N8N-Webhook-Secret).
   */
  @Public() // bypass JWT
  @UseGuards(WebhookSecretGuard)
  @Post('justificacion-ausencia')
  @HttpCode(200)
  procesarJustificacion(
    @Body() dto: WebhookJustificacionDto,
    @Req() req: { ip?: string; headers: Record<string, string | string[] | undefined> },
  ): Promise<WebhookJustificacionResponse> {
    const fwd = req.headers['x-forwarded-for'];
    const ip = typeof fwd === 'string' ? fwd.split(',')[0]!.trim() : (req.ip ?? null);
    return this.service.procesarJustificacion(dto, ip);
  }
}
