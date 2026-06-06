import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Public } from '../../auth/decorators/public.decorator';
import type { AuthenticatedUser } from '../../auth/types';
import { WebhookSecretGuard } from '../webhooks/webhook-secret.guard';
import { VinculacionService } from './vinculacion.service';
import { ConfirmarVinculacionDto, GenerarVinculacionDto } from './vinculacion.dto';

@Controller('api/v3/canales/vinculacion')
export class VinculacionController {
  constructor(private readonly service: VinculacionService) {}

  /**
   * GENERAR — lo llama la APP móvil con el JWT del empleado.
   * El empleadoId se toma del JWT (NO del body).
   * Respuesta: { codigo, expiraEnSegundos }.
   */
  @Post('generar')
  async generar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GenerarVinculacionDto,
  ): Promise<{ codigo: string; expiraEnSegundos: number }> {
    if (user.empleadoId == null) {
      throw new BadRequestException('Tu usuario no tiene un empleado asociado.');
    }
    return this.service.generar(user.empleadoId, dto.tipoCanal);
  }

  /**
   * CONFIRMAR — lo llama n8n (NO JWT) con el header X-N8N-Webhook-Secret.
   * Body: { codigo, tipoCanal, identificadorCanal: <chat_id> }.
   * Respuesta: { ok, empleadoNombreCompleto?, reVinculado? } | { ok:false, motivo }.
   */
  @Public() // bypass JWT
  @UseGuards(WebhookSecretGuard)
  @Post('confirmar')
  @HttpCode(200)
  confirmar(@Body() dto: ConfirmarVinculacionDto) {
    return this.service.confirmar(dto.codigo, dto.tipoCanal, dto.identificadorCanal);
  }
}
