import { FASTAPI_GRAPHQL_URL } from './apiClient';

export const asistenciaService = {
  registrar: async (empleadoId: number, photoBase64: string, latitud: number, longitud: number) => {

    const query = `
      mutation ($empleadoId: Int!, $fotoBase64: String!, $latitud: Float!, $longitud: Float!) {
        registrarAsistencia(
          empleadoId: $empleadoId,
          fotoBase64: $fotoBase64,
          latitud: $latitud,
          longitud: $longitud,
        ) {
          success
          message
          marcacion {
            id
            estado
            estadoPlanilla
            horaEntrada
            horaSalida
          }
        }
      }
    `;

    const variables = {
      empleadoId,
      fotoBase64,
      latitud,
      longitud,
    };

    try {
      const response = await fetch(FASTAPI_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });

      const json = await response.json();
      
      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      const result = json.data.registrarAsistencia;
      
      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    } catch (error) {
      console.error('Error in registrarAsistencia:', error);
      throw error;
    }
  }
};
