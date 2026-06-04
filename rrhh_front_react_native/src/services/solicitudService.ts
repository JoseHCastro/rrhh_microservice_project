import { gql } from './apiClient';
import { SolicitudAusencia, EstadoSolicitud } from '@/types/solicitud';

// ─── Interfaces de respuesta GraphQL ─────────────────────────────────────────

interface GetSolicitudesResponse {
  solicitudesAusencia: SolicitudAusencia[];
}

// ─── Query ────────────────────────────────────────────────────────────────────

const GET_SOLICITUDES_AUSENCIA = `
  query GetSolicitudesAusencia($estado: EstadoSolicitud, $empleadoId: ID) {
    solicitudesAusencia(estado: $estado, empleadoId: $empleadoId) {
      id
      tipoAusencia {
        id
        nombre
      }
      fechaInicio
      fechaFin
      estado
      fechaSolicitud
      aprobador {
        username
      }
    }
  }
`;

// ─── Service ──────────────────────────────────────────────────────────────────

export const solicitudService = {
  /**
   * Obtiene todas las solicitudes de ausencia del empleado autenticado.
   * Se puede filtrar opcionalmente por estado.
   */
  async getMisSolicitudes(
    empleadoId?: number,
    estado?: EstadoSolicitud,
  ): Promise<SolicitudAusencia[]> {
    const variables: Record<string, any> = {};
    if (empleadoId !== undefined) variables.empleadoId = empleadoId;
    if (estado !== undefined) variables.estado = estado;

    const data = await gql<GetSolicitudesResponse>(
      GET_SOLICITUDES_AUSENCIA,
      variables,
    );
    return data.solicitudesAusencia ?? [];
  },
};
