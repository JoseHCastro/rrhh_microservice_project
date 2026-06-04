export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface TipoAusencia {
  id: number;
  nombre: string;
}

export interface AprobadorSolicitud {
  username: string;
}

export interface SolicitudAusencia {
  id: number;
  tipoAusencia: TipoAusencia;
  fechaInicio: string;   // ISO date "YYYY-MM-DD"
  fechaFin: string;      // ISO date "YYYY-MM-DD"
  estado: EstadoSolicitud;
  fechaSolicitud: string; // ISO datetime
  aprobador?: AprobadorSolicitud;
}
