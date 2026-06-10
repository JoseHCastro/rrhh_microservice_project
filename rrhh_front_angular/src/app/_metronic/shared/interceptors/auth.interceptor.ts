import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// URLs de producción a las que está permitido adjuntar el JWT.
// Si la petición va a un dominio distinto (ej. un CDN o API externa), el token NO se adjunta.
const ALLOWED_ORIGINS: string[] = [
  environment.apiUrl,
  environment.nestUrl,
  environment.fastapiUrl,
  environment.fastapiGql,
];

/**
 * Adjunta el JWT (si existe) ÚNICAMENTE a peticiones que se dirijan
 * a los microservicios propios del sistema RRHH (Spring Boot, NestJS, FastAPI).
 * Esto evita filtrar el token de autenticación a dominios externos de terceros.
 * Vive en _metronic porque es infraestructura genérica, no negocio.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('auth_token');

    // Solo inyectar el token si la petición va a uno de nuestros microservicios.
    const isOwnService = ALLOWED_ORIGINS.some((origin) =>
      request.url.startsWith(origin)
    );

    if (token && isOwnService) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(request);
  }
}
