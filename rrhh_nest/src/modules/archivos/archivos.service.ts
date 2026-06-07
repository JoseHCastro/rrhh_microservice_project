import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Archivo, EstadoArchivo } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { S3Service } from '../../shared/s3/s3.service';
import { BitacoraService } from '../bitacora/bitacora.service';
import { AccionBitacora, ResultadoBitacora } from '../bitacora/bitacora.enums';
import type { AuthenticatedUser } from '../../auth/types';
import {
  ConfirmarSubidaArchivoInput,
  FiltrosArchivoInput,
  IniciarSubidaArchivoInput,
} from './archivo.input';

@Injectable()
export class ArchivosService {
  private readonly logger = new Logger(ArchivosService.name);
  private readonly presignedExpiresSeconds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly bitacora: BitacoraService,
    config: ConfigService,
  ) {
    this.presignedExpiresSeconds = config.getOrThrow<number>(
      'S3_PRESIGNED_URL_EXPIRES_SECONDS',
    );
  }

  async listar(filtros: FiltrosArchivoInput) {
    const page = filtros.page ?? 0;
    const size = filtros.size ?? 20;

    const where = {
      estado: { not: EstadoArchivo.ELIMINADO },
      ...(filtros.categoria ? { categoria: filtros.categoria } : {}),
      ...(filtros.empleadoId ? { empleadoId: filtros.empleadoId } : {}),
    };

    const [content, totalElements] = await this.prisma.$transaction([
      this.prisma.archivo.findMany({
        where,
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.archivo.count({ where }),
    ]);

    const totalPages = Math.ceil(totalElements / size);
    return {
      content,
      pageInfo: {
        totalElements,
        totalPages,
        currentPage: page,
        pageSize: size,
        hasNext: page + 1 < totalPages,
      },
    };
  }

  async findById(id: bigint): Promise<Archivo> {
    const a = await this.prisma.archivo.findUnique({ where: { id } });
    if (!a || a.estado === EstadoArchivo.ELIMINADO) {
      throw new NotFoundException(`Archivo ${id} no existe`);
    }
    return a;
  }

  /**
   * Verifica que el usuario tenga el privilegio de lectura del archivo.
   * Si el archivo no exige privilegio, solo basta con estar autenticado.
   * ROLE_ADMIN siempre pasa. Si deniega, registra en bitácora.
   */
  async asegurarLectura(user: AuthenticatedUser, archivo: Archivo, ip?: string | null): Promise<void> {
    if (user.roles.includes('ROLE_ADMIN')) return;
    const requerido = archivo.privilegioLecturaCodigo;
    if (!requerido) return;
    if (!user.privilegios.includes(requerido)) {
      await this.bitacora.registrar({
        usuarioId: user.id,
        archivoId: archivo.id,
        accion: AccionBitacora.ACCESO_DENEGADO,
        resultado: ResultadoBitacora.DENEGADO,
        ipOrigen: ip,
        motivoDenegacion: `Falta privilegio de lectura '${requerido}'`,
      });
      throw new ForbiddenException(
        `Para ver este archivo se requiere el privilegio '${requerido}'`,
      );
    }
  }

  /**
   * Idem para descarga.
   */
  async asegurarDescarga(user: AuthenticatedUser, archivo: Archivo, ip?: string | null): Promise<void> {
    if (user.roles.includes('ROLE_ADMIN')) return;
    const requerido = archivo.privilegioDescargaCodigo;
    if (!requerido) return;
    if (!user.privilegios.includes(requerido)) {
      await this.bitacora.registrar({
        usuarioId: user.id,
        archivoId: archivo.id,
        accion: AccionBitacora.ACCESO_DENEGADO,
        resultado: ResultadoBitacora.DENEGADO,
        ipOrigen: ip,
        motivoDenegacion: `Falta privilegio de descarga '${requerido}'`,
      });
      throw new ForbiddenException(
        `Para descargar este archivo se requiere el privilegio '${requerido}'`,
      );
    }
  }

  async iniciarSubida(input: IniciarSubidaArchivoInput, subidoPorId: bigint) {
    if (input.empleadoId) {
      const exists = await this.prisma.empleado.findUnique({
        where: { id: input.empleadoId },
        select: { id: true },
      });
      if (!exists) throw new NotFoundException(`Empleado ${input.empleadoId} no existe`);
    }

    const ext = this.extensionFromContentType(input.contentType);
    const s3Key = this.buildS3Key(input.categoria, input.empleadoId, ext);

    const archivo = await this.prisma.archivo.create({
      data: {
        nombre: input.nombre,
        descripcion: input.descripcion,
        categoria: input.categoria,
        s3Key,
        contentType: input.contentType,
        empleadoId: input.empleadoId,
        privilegioLecturaCodigo: input.privilegioLecturaCodigo,
        privilegioDescargaCodigo: input.privilegioDescargaCodigo,
        subidoPorId,
        estado: EstadoArchivo.PENDIENTE_SUBIDA,
      },
    });

    const presignedUrl = await this.s3.getPresignedUploadUrl(s3Key, input.contentType);
    return {
      archivo,
      presignedUrl,
      expiresInSeconds: this.presignedExpiresSeconds,
    };
  }

  async confirmarSubida(
    input: ConfirmarSubidaArchivoInput,
    user: AuthenticatedUser,
    ip?: string | null,
  ): Promise<Archivo> {
    const archivo = await this.prisma.archivo.findUnique({
      where: { id: input.archivoId },
    });
    if (!archivo) throw new NotFoundException(`Archivo ${input.archivoId} no existe`);
    if (archivo.estado !== EstadoArchivo.PENDIENTE_SUBIDA) {
      throw new BadRequestException('El archivo no está pendiente de subida');
    }
    const existe = await this.s3.objectExists(archivo.s3Key);
    if (!existe) {
      throw new BadRequestException(
        'El objeto no se encontró en S3 — confirma que el cliente subió correctamente',
      );
    }
    const actualizado = await this.prisma.archivo.update({
      where: { id: archivo.id },
      data: {
        estado: EstadoArchivo.ACTIVO,
        hashSha256: input.hashSha256,
        tamanioBytes: input.tamanioBytes != null ? BigInt(input.tamanioBytes) : undefined,
      },
    });
    await this.bitacora.registrar({
      usuarioId: user.id,
      archivoId: actualizado.id,
      accion: AccionBitacora.SUBIR_S3,
      ipOrigen: ip,
      plataforma: 'WEB',
      documentoS3Url: `s3://${actualizado.s3Key}`,
    });
    return actualizado;
  }

  async urlDescarga(
    id: bigint,
    user: AuthenticatedUser,
    ip?: string | null,
  ): Promise<{ archivo: Archivo; url: string }> {
    const archivo = await this.findById(id);
    if (archivo.estado !== EstadoArchivo.ACTIVO) {
      throw new BadRequestException('El archivo no está disponible para descarga');
    }
    await this.asegurarDescarga(user, archivo, ip);
    const url = await this.s3.getPresignedDownloadUrl(archivo.s3Key);
    await this.bitacora.registrar({
      usuarioId: user.id,
      archivoId: archivo.id,
      accion: AccionBitacora.DESCARGAR_S3,
      ipOrigen: ip,
      plataforma: 'WEB',
      documentoS3Url: `s3://${archivo.s3Key}`,
    });
    return { archivo, url };
  }

  async eliminar(
    id: bigint,
    user: AuthenticatedUser,
    ip?: string | null,
    borrarDeS3 = false,
  ): Promise<boolean> {
    const archivo = await this.findById(id);
    await this.prisma.archivo.update({
      where: { id: archivo.id },
      data: { estado: EstadoArchivo.ELIMINADO },
    });
    if (borrarDeS3) {
      try {
        await this.s3.deleteObject(archivo.s3Key);
      } catch (err) {
        this.logger.warn(`No se pudo eliminar S3 object ${archivo.s3Key}: ${err}`);
      }
    }
    await this.bitacora.registrar({
      usuarioId: user.id,
      archivoId: archivo.id,
      accion: AccionBitacora.ELIMINAR_S3,
      ipOrigen: ip,
      plataforma: 'WEB',
      documentoS3Url: `s3://${archivo.s3Key}`,
    });
    return true;
  }

  private buildS3Key(categoria: string, empleadoId: bigint | undefined, ext: string): string {
    const prefix = empleadoId ? `${categoria.toLowerCase()}/${empleadoId}` : categoria.toLowerCase();
    return `archivos/${prefix}/${uuidv4()}${ext}`;
  }

  private extensionFromContentType(contentType: string): string {
    const map: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'text/plain': '.txt',
    };
    return map[contentType] ?? '';
  }
}
