import { registerEnumType } from '@nestjs/graphql';
import { CategoriaArchivo, EstadoArchivo } from '@prisma/client';

registerEnumType(CategoriaArchivo, {
  name: 'CategoriaArchivo',
  description: 'Categoría funcional del archivo',
});

registerEnumType(EstadoArchivo, {
  name: 'EstadoArchivo',
  description: 'Estado del ciclo de vida del archivo',
});

export { CategoriaArchivo, EstadoArchivo };
