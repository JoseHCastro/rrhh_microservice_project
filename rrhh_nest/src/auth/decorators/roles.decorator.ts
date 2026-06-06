import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'requiredRoles';

/**
 * Exige uno o más roles. Si el usuario tiene cualquiera, pasa.
 * Ej: @Roles('ROLE_ADMIN', 'ROLE_RRHH')
 */
export const Roles = (...roles: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);
