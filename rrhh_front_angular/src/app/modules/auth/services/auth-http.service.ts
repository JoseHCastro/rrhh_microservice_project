import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.models';

/** Acceso a datos de autenticación (REST). Sin lógica de negocio. */
@Injectable({ providedIn: 'root' })
export class AuthHttpService {
  constructor(private http: HttpClient) {}

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.apiUrl + environment.loginPath, body);
  }

  refresh(refreshToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      environment.apiUrl + environment.refreshPath,
      {},
      { headers: { 'X-Refresh-Token': refreshToken } }
    );
  }
}
