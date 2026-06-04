/**
 * src/services/sessionStore.ts
 *
 * Almacén en memoria para el estado de autenticación (tokens y sesión).
 */

export interface UserSession {
  username: string;
  roles: string[];
}

interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserSession | null;
}

let state: SessionState = {
  accessToken: null,
  refreshToken: null,
  user: null,
};

export const sessionStore = {
  save(accessToken: string, refreshToken: string, user: UserSession): void {
    state = { accessToken, refreshToken, user };
  },

  clear(): void {
    state = { accessToken: null, refreshToken: null, user: null };
  },

  getToken(): string | null {
    return state.accessToken;
  },

  getRefreshToken(): string | null {
    return state.refreshToken;
  },

  getUser(): UserSession | null {
    return state.user;
  },

  isAuthenticated(): boolean {
    return state.accessToken !== null;
  },
};
