/**
 * Seed inicial del Módulo 3 (schema `seguridad`).
 *
 * Ejecutar:
 *   npx prisma db seed
 *
 * Idempotente: usa upsert por código/nombre. Se puede correr múltiples veces
 * sin duplicar registros.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Privilegios finos. Convención: <RECURSO>_<ACCION>[_<SUBTIPO>]
const PRIVILEGIOS = [
  // ─── Gestión de privilegios y grupos (solo ADMIN) ───
  { codigo: 'PRIVILEGIO_GESTIONAR', nombre: 'Gestionar privilegios', modulo: 'seguridad',
    descripcion: 'Crear, editar y eliminar privilegios del sistema.' },
  { codigo: 'GRUPO_GESTIONAR', nombre: 'Gestionar grupos', modulo: 'seguridad',
    descripcion: 'Crear, editar y eliminar grupos de seguridad.' },
  { codigo: 'GRUPO_ASIGNAR_USUARIOS', nombre: 'Asignar usuarios a grupos', modulo: 'seguridad',
    descripcion: 'Incluir o remover usuarios de un grupo de seguridad.' },

  // ─── Archivos: lectura/descarga por categoría ───
  { codigo: 'ARCHIVO_LEER_CONTRATO', nombre: 'Ver contratos', modulo: 'archivos',
    descripcion: 'Ver metadata de contratos de empleados.' },
  { codigo: 'ARCHIVO_DESCARGAR_CONTRATO', nombre: 'Descargar contratos', modulo: 'archivos',
    descripcion: 'Obtener URL de descarga de contratos.' },
  { codigo: 'ARCHIVO_LEER_CERTIFICADO_MEDICO', nombre: 'Ver certificados médicos', modulo: 'archivos',
    descripcion: 'Ver metadata de certificados médicos.' },
  { codigo: 'ARCHIVO_DESCARGAR_CERTIFICADO_MEDICO', nombre: 'Descargar certificados médicos', modulo: 'archivos',
    descripcion: 'Obtener URL de descarga de certificados médicos.' },
  { codigo: 'ARCHIVO_LEER_FOTO', nombre: 'Ver fotos', modulo: 'archivos',
    descripcion: 'Ver metadata de fotos de empleados.' },
  { codigo: 'ARCHIVO_DESCARGAR_FOTO', nombre: 'Descargar fotos', modulo: 'archivos',
    descripcion: 'Obtener URL de descarga de fotos.' },

  // ─── Archivos: escritura ───
  { codigo: 'ARCHIVO_SUBIR', nombre: 'Subir archivos', modulo: 'archivos',
    descripcion: 'Subir archivos nuevos al sistema (S3).' },
  { codigo: 'ARCHIVO_ELIMINAR', nombre: 'Eliminar archivos', modulo: 'archivos',
    descripcion: 'Marcar archivos como eliminados (borrado lógico).' },

  // ─── Bitácora (auditoría DynamoDB) ───
  { codigo: 'BITACORA_CONSULTAR', nombre: 'Consultar bitácora de accesos', modulo: 'auditoria',
    descripcion: 'Ver registros de auditoría en DynamoDB.' },

  // ─── Reportes administrativos (solo ADMIN por ahora) ───
  { codigo: 'REPORTES_GENERAR', nombre: 'Generar reportes', modulo: 'reportes',
    descripcion: 'Ejecutar los reportes administrativos (empleados, asistencia, justificaciones, accesos).' },

  // ─── Justificaciones de ausencia (canal n8n) ───
  { codigo: 'JUSTIFICACION_VER_TODAS', nombre: 'Ver todas las justificaciones', modulo: 'justificaciones',
    descripcion: 'Listar justificaciones de cualquier empleado.' },
  { codigo: 'JUSTIFICACION_APROBAR', nombre: 'Aprobar/rechazar justificaciones', modulo: 'justificaciones',
    descripcion: 'Resolver una justificación pendiente.' },

  // ─── Canales (mapeo Telegram↔empleado) ───
  { codigo: 'CANAL_EMPLEADO_GESTIONAR', nombre: 'Gestionar canales de empleados', modulo: 'justificaciones',
    descripcion: 'Registrar y verificar canales externos (Telegram, WhatsApp, Email) de empleados.' },
] as const;

// Grupos base. Cada uno agrupa privilegios típicos de su rol funcional.
const GRUPOS = [
  {
    nombre: 'Administradores de Seguridad',
    descripcion: 'Acceso total a la gestión de privilegios, grupos y bitácora.',
    privilegios: [
      'PRIVILEGIO_GESTIONAR',
      'GRUPO_GESTIONAR',
      'GRUPO_ASIGNAR_USUARIOS',
      'BITACORA_CONSULTAR',
      'CANAL_EMPLEADO_GESTIONAR',
      'REPORTES_GENERAR',
    ],
  },
  {
    nombre: 'RRHH - Documentos',
    descripcion: 'Gestiona contratos y archivos administrativos del personal.',
    privilegios: [
      'ARCHIVO_LEER_CONTRATO',
      'ARCHIVO_DESCARGAR_CONTRATO',
      'ARCHIVO_LEER_FOTO',
      'ARCHIVO_DESCARGAR_FOTO',
      'ARCHIVO_SUBIR',
      'ARCHIVO_ELIMINAR',
    ],
  },
  {
    nombre: 'Supervisores - Justificaciones',
    descripcion: 'Reciben y aprueban justificaciones médicas de su equipo.',
    privilegios: [
      'ARCHIVO_LEER_CERTIFICADO_MEDICO',
      'ARCHIVO_DESCARGAR_CERTIFICADO_MEDICO',
      'JUSTIFICACION_VER_TODAS',
      'JUSTIFICACION_APROBAR',
    ],
  },
  {
    nombre: 'Gerentes - Solo Lectura',
    descripcion: 'Pueden ver y descargar contratos pero no modificarlos.',
    privilegios: [
      'ARCHIVO_LEER_CONTRATO',
      'ARCHIVO_DESCARGAR_CONTRATO',
      'ARCHIVO_LEER_FOTO',
    ],
  },
] as const;

async function main(): Promise<void> {
  console.log('▶ Sembrando privilegios...');
  for (const p of PRIVILEGIOS) {
    await prisma.privilegio.upsert({
      where: { codigo: p.codigo },
      update: { nombre: p.nombre, descripcion: p.descripcion, modulo: p.modulo },
      create: p,
    });
  }
  console.log(`  ✓ ${PRIVILEGIOS.length} privilegios`);

  console.log('▶ Sembrando grupos...');
  for (const g of GRUPOS) {
    const grupo = await prisma.grupo.upsert({
      where: { nombre: g.nombre },
      update: { descripcion: g.descripcion, activo: true },
      create: { nombre: g.nombre, descripcion: g.descripcion, activo: true },
    });

    // Resolver IDs de los privilegios por código
    const privs = await prisma.privilegio.findMany({
      where: { codigo: { in: [...g.privilegios] } },
      select: { id: true },
    });

    // Reset + reasignar (idempotente)
    await prisma.grupoPrivilegio.deleteMany({ where: { grupoId: grupo.id } });
    await prisma.grupoPrivilegio.createMany({
      data: privs.map((p) => ({ grupoId: grupo.id, privilegioId: p.id })),
      skipDuplicates: true,
    });
  }
  console.log(`  ✓ ${GRUPOS.length} grupos con sus privilegios`);

  console.log('✅ Seed completado');
}

main()
  .catch((err) => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
