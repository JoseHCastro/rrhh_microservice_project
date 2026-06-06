/**
 * Información del usuario autenticado, resuelta a partir del JWT + DB.
 */
export interface AuthenticatedUser {
  id: bigint;               // usuarios.id
  empleadoId: bigint | null; // public.usuarios.empleado_id (null si no tiene empleado)
  username: string;
  activo: boolean;
  roles: string[];          // ['ROLE_ADMIN', 'ROLE_RRHH', ...]
  privilegios: string[];    // Códigos de privilegios resueltos via grupos
}

/**
 * Payload que viene en el JWT emitido por rrhh_spring_boot.
 * Spring Boot solo pone sub/iat/exp — los roles se cargan de DB.
 */
export interface JwtPayload {
  sub: string;  // username
  iat: number;
  exp: number;
}
