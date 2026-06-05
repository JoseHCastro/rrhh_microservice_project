import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { AuthHttpService } from './auth-http.service';
import { AuthUser } from '../models/auth.models';

/**
 * Lógica de negocio de autenticación: estado del usuario, token y sesión.
 * El token se almacena en 'auth_token' (lo lee el AuthInterceptor).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly _user = new BehaviorSubject<AuthUser | null>(this.decode(this.token));
  readonly user$ = this._user.asObservable();

  constructor(private api: AuthHttpService, private router: Router) {}

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  get isAuthenticated(): boolean {
    return !!this.token;
  }
  get currentUser(): AuthUser | null {
    return this._user.value;
  }

  login(username: string, password: string): Observable<AuthUser | null> {
    return this.api.login({ username, password }).pipe(
      tap((res) => this.setToken(res.accessToken)),
      map(() => this._user.value)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this._user.next(null);
    this.router.navigate(['/auth/login']);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._user.next(this.decode(token));
  }

  /** Decodifica el payload del JWT para extraer username y roles. */
  private decode(token: string | null): AuthUser | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? ''));
      const rawRoles = payload.roles ?? payload.authorities ?? payload.scope ?? [];
      const roles = Array.isArray(rawRoles)
        ? rawRoles
        : String(rawRoles).split(/[\s,]+/).filter(Boolean);
      return { username: payload.sub ?? payload.username ?? 'usuario', roles };
    } catch {
      return { username: 'usuario', roles: [] };
    }
  }
}
