import { registerEnumType } from '@nestjs/graphql';
import { TipoCanal } from '@prisma/client';

registerEnumType(TipoCanal, {
  name: 'TipoCanal',
  description: 'Canal externo del empleado (Telegram/WhatsApp/Email)',
});

export { TipoCanal };
