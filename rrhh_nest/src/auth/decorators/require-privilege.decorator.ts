import { SetMetadata } from '@nestjs/common';

export const PRIVILEGES_KEY = 'requiredPrivileges';

/**
 * Exige uno o más códigos de privilegio. Si el usuario tiene cualquiera, pasa.
 * Ej: @RequirePrivilege('ARCHIVO_DESCARGAR_CONTRATO')
 */
export const RequirePrivilege = (
  ...privilegeCodes: string[]
): MethodDecorator & ClassDecorator =>
  SetMetadata(PRIVILEGES_KEY, privilegeCodes);
