import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Cliente mínimo del Bot API de Telegram (mismo bot que usa n8n).
 * El token va en TELEGRAM_BOT_TOKEN (.env) — NO hardcodeado.
 *
 * `enviarMensaje` NUNCA lanza: devuelve { ok, error } para que el caller
 * decida. Así un fallo de Telegram no rompe la operación de negocio.
 */
@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly token: string;

  constructor(config: ConfigService) {
    this.token = config.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
  }

  async enviarMensaje(
    chatId: string,
    texto: string,
  ): Promise<{ ok: boolean; error?: string }> {
    if (!this.token) {
      const error = 'TELEGRAM_BOT_TOKEN no configurado';
      this.logger.error(error);
      return { ok: false, error };
    }
    try {
      const resp = await fetch(
        `https://api.telegram.org/bot${this.token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: texto }),
        },
      );
      if (!resp.ok) {
        const body = await resp.text();
        const error = `Telegram HTTP ${resp.status}: ${body.slice(0, 200)}`;
        this.logger.error(error);
        return { ok: false, error };
      }
      this.logger.log(`Telegram enviado a chat ${chatId}`);
      return { ok: true };
    } catch (err: any) {
      const error = `Error de red Telegram: ${err?.message ?? err}`;
      this.logger.error(error);
      return { ok: false, error };
    }
  }
}
