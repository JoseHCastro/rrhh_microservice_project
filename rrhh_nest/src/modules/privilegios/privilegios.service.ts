import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ActualizarPrivilegioInput, CrearPrivilegioInput } from './privilegio.input';

@Injectable()
export class PrivilegiosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(modulo?: string) {
    return this.prisma.privilegio.findMany({
      where: modulo ? { modulo } : undefined,
      orderBy: [{ modulo: 'asc' }, { codigo: 'asc' }],
    });
  }

  async findById(id: bigint) {
    const p = await this.prisma.privilegio.findUnique({ where: { id } });
    if (!p) throw new NotFoundException(`Privilegio ${id} no existe`);
    return p;
  }

  async crear(input: CrearPrivilegioInput) {
    try {
      return await this.prisma.privilegio.create({ data: input });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(`Ya existe un privilegio con código '${input.codigo}'`);
      }
      throw err;
    }
  }

  async actualizar(id: bigint, input: ActualizarPrivilegioInput) {
    await this.findById(id);
    return this.prisma.privilegio.update({ where: { id }, data: input });
  }

  async eliminar(id: bigint): Promise<boolean> {
    await this.findById(id);
    await this.prisma.privilegio.delete({ where: { id } });
    return true;
  }
}
