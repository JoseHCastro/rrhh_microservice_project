import { gql } from './apiClient';
import { Preplanilla } from '@/types/nomina';

export const nominaService = {
  getMisPreplanillas: async (empleadoId: string): Promise<Preplanilla[]> => {
    const query = `
      query GetMisPreplanillas($empleadoId: ID!) {
        preplanillas(empleadoId: $empleadoId) {
          id
          periodo
          s3KeyUri
          diasTrabajados
          faltas
          retrasos
          horasExtra
          fechaCreacion
        }
      }
    `;
    const data = await gql<{ preplanillas: Preplanilla[] }>(query, { empleadoId });
    return data.preplanillas;
  }
};
