import { registerEnumType } from '@nestjs/graphql';
import { EstadoJustificacion } from '@prisma/client';

registerEnumType(EstadoJustificacion, {
  name: 'EstadoJustificacion',
  description: 'Estado de una justificación de ausencia',
});

export { EstadoJustificacion };
