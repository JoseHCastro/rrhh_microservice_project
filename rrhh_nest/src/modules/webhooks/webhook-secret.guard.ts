import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Protege rutas de webhook con un secret simétrico compartido con n8n.
 * El cliente debe enviar el header `X-N8N-Webhook-Secret: <valor>`.
 *
 * Es ortogonal al JWT: las rutas marcadas con @Public() y @UseGuards(WebhookSecretGuard)
 * bypasean Passport-JWT pero exigen el header secreto.
 */
@Injectable()
export class WebhookSecretGuard implements CanActivate {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = config.getOrThrow<string>('N8N_WEBHOOK_SECRET');
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const provided =
      (req.headers['x-n8n-webhook-secret'] as string | undefined) ??
      (req.headers['X-N8N-Webhook-Secret'] as string | undefined);
    if (!provided || provided !== this.secret) {
      throw new UnauthorizedException('Webhook secret inválido');
    }
    return true;
  }
}
