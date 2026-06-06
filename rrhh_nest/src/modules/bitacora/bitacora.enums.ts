import { registerEnumType } from '@nestjs/graphql';

/**
 * Tipos de acción auditados. Vocabulario OFICIAL del equipo
 * (Documentacion contexto/tutorial.md + implementacion.md): la tabla compartida
 * `BitacoraAuditoria` usa DESCARGAR_S3 / SUBIR_S3 / ELIMINAR_S3.
 * ACCESO_DENEGADO es una extensión propia del Módulo 3 (intento denegado);
 * como DynamoDB es schemaless, no rompe a los demás módulos.
 */
export enum AccionBitacora {
  SUBIR_S3 = 'SUBIR_S3',
  DESCARGAR_S3 = 'DESCARGAR_S3',
  ELIMINAR_S3 = 'ELIMINAR_S3',
  ACCESO_DENEGADO = 'ACCESO_DENEGADO',
}

export enum ResultadoBitacora {
  OK = 'OK',
  DENEGADO = 'DENEGADO',
  ERROR = 'ERROR',
}

registerEnumType(AccionBitacora, {
  name: 'AccionBitacora',
});

registerEnumType(ResultadoBitacora, {
  name: 'ResultadoBitacora',
});
