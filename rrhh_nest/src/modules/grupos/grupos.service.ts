import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  ActualizarGrupoInput,
  CrearGrupoInput,
} from './grupo.input';

@Injectable()
export class GruposService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(soloActivos = false) {
    return this.prisma.grupo.findMany({
      where: soloActivos ? { activo: true } : undefined,
      orderBy: { nombre: 'asc' },
    });
  }

  async findById(id: bigint) {
    const g = await this.prisma.grupo.findUnique({ where: { id } });
    if (!g) throw new NotFoundException(`Grupo ${id} no existe`);
    return g;
  }

  async privilegiosDelGrupo(grupoId: bigint) {
    const rows = await this.prisma.grupoPrivilegio.findMany({
      where: { grupoId },
      include: { privilegio: true },
    });
    return rows.map((r) => r.privilegio);
  }

  countUsuarios(grupoId: bigint) {
    return this.prisma.usuarioGrupo.count({ where: { grupoId } });
  }

  async usuariosDelGrupo(grupoId: bigint) {
    const rows = await this.prisma.usuarioGrupo.findMany({
      where: { grupoId },
      include: { usuario: true },
      orderBy: { asignadoAt: 'desc' },
    });
    return rows.map((r) => ({
      usuarioId: r.usuarioId,
      username: r.usuario.username,
      asignadoAt: r.asignadoAt,
      asignadoPorId: r.asignadoPorId,
    }));
  }

  async crear(input: CrearGrupoInput) {
    return this.prisma.$transaction(async (tx) => {
      try {
        const grupo = await tx.grupo.create({
          data: {
            nombre: input.nombre,
            descripcion: input.descripcion,
          },
        });

        if (input.privilegioCodigos?.length) {
          const privs = await tx.privilegio.findMany({
            where: { codigo: { in: input.privilegioCodigos } },
            select: { id: true, codigo: true },
          });
          this.validarCodigosEncontrados(input.privilegioCodigos, privs.map((p) => p.codigo));
          await tx.grupoPrivilegio.createMany({
            data: privs.map((p) => ({ grupoId: grupo.id, privilegioId: p.id })),
            skipDuplicates: true,
          });
        }
        return grupo;
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          throw new ConflictException(`Ya existe un grupo con nombre '${input.nombre}'`);
        }
        throw err;
      }
    });
  }

  async actualizar(id: bigint, input: ActualizarGrupoInput) {
    await this.findById(id);
    try {
      return await this.prisma.grupo.update({ where: { id }, data: input });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(`Ya existe un grupo con ese nombre`);
      }
      throw err;
    }
  }

  async eliminar(id: bigint): Promise<boolean> {
    await this.findById(id);
    await this.prisma.grupo.delete({ where: { id } });
    return true;
  }

  async asignarPrivilegio(grupoId: bigint, privilegioCodigo: string) {
    await this.findById(grupoId);
    const priv = await this.prisma.privilegio.findUnique({
      where: { codigo: privilegioCodigo },
    });
    if (!priv) {
      throw new NotFoundException(`Privilegio '${privilegioCodigo}' no existe`);
    }
    await this.prisma.grupoPrivilegio.upsert({
      where: { grupoId_privilegioId: { grupoId, privilegioId: priv.id } },
      create: { grupoId, privilegioId: priv.id },
      update: {},
    });
    return this.findById(grupoId);
  }

  async revocarPrivilegio(grupoId: bigint, privilegioCodigo: string) {
    await this.findById(grupoId);
    const priv = await this.prisma.privilegio.findUnique({
      where: { codigo: privilegioCodigo },
    });
    if (!priv) {
      throw new NotFoundException(`Privilegio '${privilegioCodigo}' no existe`);
    }
    await this.prisma.grupoPrivilegio
      .delete({
        where: { grupoId_privilegioId: { grupoId, privilegioId: priv.id } },
      })
      .catch(() => undefined); // No-op si no existía
    return this.findById(grupoId);
  }

  async asignarUsuario(usuarioId: bigint, grupoId: bigint, asignadoPorId: bigint) {
    await this.findById(grupoId);
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) {
      throw new NotFoundException(`Usuario ${usuarioId} no existe`);
    }
    await this.prisma.usuarioGrupo.upsert({
      where: { usuarioId_grupoId: { usuarioId, grupoId } },
      create: { usuarioId, grupoId, asignadoPorId },
      update: { asignadoPorId, asignadoAt: new Date() },
    });
    return this.findById(grupoId);
  }

  async removerUsuario(usuarioId: bigint, grupoId: bigint): Promise<boolean> {
    await this.findById(grupoId);
    await this.prisma.usuarioGrupo
      .delete({ where: { usuarioId_grupoId: { usuarioId, grupoId } } })
      .catch(() => undefined);
    return true;
  }

  async privilegiosDelUsuario(usuarioId: bigint): Promise<string[]> {
    const rows = await this.prisma.usuarioGrupo.findMany({
      where: { usuarioId, grupo: { activo: true } },
      include: {
        grupo: { include: { privilegios: { include: { privilegio: true } } } },
      },
    });
    const codigos = new Set<string>();
    for (const ug of rows) {
      for (const gp of ug.grupo.privilegios) {
        codigos.add(gp.privilegio.codigo);
      }
    }
    return [...codigos];
  }

  private validarCodigosEncontrados(solicitados: string[], encontrados: string[]) {
    const missing = solicitados.filter((c) => !encontrados.includes(c));
    if (missing.length) {
      throw new NotFoundException(
        `Privilegios no existen: ${missing.join(', ')}`,
      );
    }
  }
}
