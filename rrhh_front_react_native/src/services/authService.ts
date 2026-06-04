/**
 * src/services/authService.ts
 *
 * Servicio de autenticación.
 */
import { restClient } from './apiClient';
import { sessionStore } from './sessionStore';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  username: string;
  roles: string[];
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const data = await restClient.post<AuthResponse>('/auth/login', credentials);

    sessionStore.save(data.accessToken, data.refreshToken, {
      username: data.username,
      roles: data.roles,
    });

    return data;
  },

  logout(): void {
    sessionStore.clear();
  },

  isAuthenticated(): boolean {
    return sessionStore.isAuthenticated();
  },

  getCurrentUser() {
    return sessionStore.getUser();
  },
};
