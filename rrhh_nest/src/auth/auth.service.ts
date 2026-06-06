import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { AuthenticatedUser } from './types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resuelve un usuario a partir del username del JWT.
   * Carga roles (public.roles) y privilegios (seguridad.privilegio via
   * usuario_grupo → grupo_privilegio).
   *
   * Lanza UnauthorizedException si el usuario no existe o está inactivo.
   */
  async resolveByUsername(username: string): Promise<AuthenticatedUser> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { username },
      include: {
        roles: { include: { rol: true } },
        grupos: {
          include: {
            grupo: {
              include: {
                privilegios: { include: { privilegio: true } },
              },
            },
          },
        },
      },
    });

    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');
    if (!usuario.activo) throw new UnauthorizedException('Usuario inactivo');

    const roles = usuario.roles.map((ur) => ur.rol.nombre);

    // Privilegios = unión de todos los privilegios de todos los grupos activos del usuario
    const privSet = new Set<string>();
    for (const ug of usuario.grupos) {
      if (!ug.grupo.activo) continue;
      for (const gp of ug.grupo.privilegios) {
        privSet.add(gp.privilegio.codigo);
      }
    }

    return {
      id: usuario.id,
      empleadoId: usuario.empleadoId ?? null,
      username: usuario.username,
      activo: usuario.activo,
      roles,
      privilegios: [...privSet],
    };
  }
}
