export interface Departamento {
  id: number;
  nombre: string;
}

export interface Cargo {
  id: number;
  nombre: string;
}

export interface Usuario {
  username: string;
}

export interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  fechaContratacion: string;
  estado: 'ACTIVO' | 'INACTIVO';
  telefono?: string;
  carnetIdentidad?: string;
  departamento: Departamento;
  cargo: Cargo;
  usuario: Usuario;
  horaEntrada?: string;
  horaSalida?: string;
}
