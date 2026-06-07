import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { TipoCanal } from './canal.enums';
import { RegistrarCanalEmpleadoInput } from './canal.input';

@Injectable()
export class CanalesService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmpleado(empleadoId: bigint) {
    return this.prisma.canalEmpleado.findMany({
      where: { empleadoId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resuelve qué empleado posee un canal externo dado.
   * Lo usa el webhook de n8n para mapear chat_id Telegram → empleado.
   */
  async findEmpleadoPorCanal(tipoCanal: TipoCanal, identificador: string) {
    const canal = await this.prisma.canalEmpleado.findUnique({
      where: { tipoCanal_identificador: { tipoCanal, identificador } },
      include: { empleado: true },
    });
    return canal;
  }

  async registrar(input: RegistrarCanalEmpleadoInput) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id: input.empleadoId },
      select: { id: true },
    });
    if (!empleado) throw new NotFoundException(`Empleado ${input.empleadoId} no existe`);

    try {
      return await this.prisma.canalEmpleado.create({
        data: {
          empleadoId: input.empleadoId,
          tipoCanal: input.tipoCanal,
          identificador: input.identificador,
          verificado: input.verificado ?? false,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `El canal ${input.tipoCanal} con identificador '${input.identificador}' ya está registrado`,
        );
      }
      throw err;
    }
  }

  async verificar(id: bigint) {
    await this.findById(id);
    return this.prisma.canalEmpleado.update({
      where: { id },
      data: { verificado: true },
    });
  }

  async eliminar(id: bigint): Promise<boolean> {
    await this.findById(id);
    await this.prisma.canalEmpleado.delete({ where: { id } });
    return true;
  }

  private async findById(id: bigint) {
    const c = await this.prisma.canalEmpleado.findUnique({ where: { id } });
    if (!c) throw new NotFoundException(`Canal ${id} no existe`);
    return c;
  }
}
