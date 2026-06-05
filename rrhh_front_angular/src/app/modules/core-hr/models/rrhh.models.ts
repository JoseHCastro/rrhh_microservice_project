// Modelos de dominio RRHH, derivados de schema.graphqls.

export enum EstadoEmpleado {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}
export enum EstadoSolicitud {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
}
export enum EstadoAsistencia {
  REGISTRADO = 'REGISTRADO',
  RETRASO = 'RETRASO',
  MARCACION_OBSERVADA = 'MARCACION_OBSERVADA',
}

export interface Departamento {
  id: string;
  nombre: string;
  gerente?: { id: string; nombreCompleto: string } | null;
}

export interface Cargo {
  id: string;
  nombre: string;
  salarioPorHora: number;
}

export interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  fechaContratacion: string;
  estado: EstadoEmpleado;
  // Opcionales: el resolver empleado(id) individual no los devuelve (bug backend);
  // en la lista sí vienen, y al detalle llegan vía router state.
  departamento?: Departamento;
  cargo?: Cargo;
  supervisor?: { id: string; nombreCompleto: string } | null;
  horaEntrada?: string;
  horaSalida?: string;
  telefono?: string | null;
  carnetIdentidad?: string | null;
}

export interface PageInfo {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
}

export interface EmpleadoPage {
  content: Empleado[];
  pageInfo: PageInfo;
}

export interface EmpleadoInput {
  nombre: string;
  apellido: string;
  fechaContratacion: string;
  departamentoId: string;
  cargoId: string;
  supervisorId?: string | null;
  horaEntrada: string;
  horaSalida: string;
  telefono?: string | null;
  carnetIdentidad?: string | null;
}

export interface RegistroAsistencia {
  id: string;
  horaEntrada: string;
  horaSalida?: string | null;
  ubicacionGps?: string | null;
  estado: EstadoAsistencia;
  estadoPlanilla?: string;
  empleado?: { id: string; nombreCompleto: string };
}

export interface RegistroAsistenciaPage {
  content: RegistroAsistencia[];
  pageInfo: PageInfo;
}

export interface SolicitudAusencia {
  id: string;
  tipoAusencia: { id: string; nombre: string };
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoSolicitud;
  fechaSolicitud?: string;
  empleado?: { id: string; nombreCompleto: string };
  aprobador?: { id: string; username: string } | null;
}

export interface Preplanilla {
  id: string;
  periodo: string;
  diasTrabajados: number;
  faltas: number;
  retrasos: number;
  permisosAprobados?: number;
  licencias?: number;
  horasExtra: number;
  marcacionesObservadas?: number;
  s3KeyUri?: string | null;
  empleado?: { id: string; nombreCompleto: string };
}

export interface TipoAusencia {
  id: string;
  nombre: string;
}

export enum NombreRol {
  ROLE_ADMIN = 'ROLE_ADMIN',
  ROLE_RRHH = 'ROLE_RRHH',
  ROLE_SUPERVISOR = 'ROLE_SUPERVISOR',
  ROLE_EMPLEADO = 'ROLE_EMPLEADO',
}

export interface Rol {
  id: string;
  nombre: NombreRol;
}

export interface UsuarioRol {
  rol: Rol;
}

export interface Usuario {
  id: string;
  username: string;
  activo: boolean;
  createdAt?: string | null;
  roles: UsuarioRol[];
}

export enum EstadoSistema {
  EMPAREJAR = 'EMPAREJAR',
  EMPAREJADO = 'EMPAREJADO',
  LECTURA = 'LECTURA',
  REGISTRADO = 'REGISTRADO',
}

export interface SistemaConfig {
  id: string;
  estado: EstadoSistema;
  fechaHoraEstado: string;
}
