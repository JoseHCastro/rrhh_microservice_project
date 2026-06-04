import { gql } from './apiClient';
import { Empleado } from '@/types/employee';

interface GetEmployeesResponse {
  empleados: {
    content: Empleado[];
  };
}

const GET_EMPLOYEES = `
  query GetEmployees {
    empleados(page: 0, size: 100) {
      content {
        id
        nombre
        apellido
        nombreCompleto
        fechaContratacion
        estado
        telefono
        carnetIdentidad
        departamento {
          id
          nombre
        }
        cargo {
          id
          nombre
        }
        usuario {
          username
        }
      }
    }
  }
`;

const GET_MY_EMPLOYEE = `
  query GetMyEmployee {
    miEmpleado {
      id
      nombre
      apellido
      nombreCompleto
      fechaContratacion
      estado
      telefono
      carnetIdentidad
      departamento {
        id
        nombre
      }
      cargo {
        id
        nombre
      }
      horaEntrada
      horaSalida
    }
  }
`;

export const employeeService = {
  /**
   * Obtiene la lista completa de empleados desde el backend GraphQL.
   */
  async getEmployees(): Promise<Empleado[]> {
    const data = await gql<GetEmployeesResponse>(GET_EMPLOYEES);
    return data.empleados?.content || [];
  },

  /**
   * Obtiene el perfil de un empleado específico mediante su username.
   */
  async getEmployeeProfileByUsername(username: string): Promise<Empleado | null> {
    const employees = await this.getEmployees();
    return employees.find(emp => emp.usuario?.username === username) || null;
  },

  /**
   * Obtiene el perfil del empleado correspondiente al usuario autenticado actual.
   */
  async getMyEmployeeProfile(): Promise<Empleado | null> {
    const data = await gql<{ miEmpleado: Empleado | null }>(GET_MY_EMPLOYEE);
    return data.miEmpleado;
  }
};
