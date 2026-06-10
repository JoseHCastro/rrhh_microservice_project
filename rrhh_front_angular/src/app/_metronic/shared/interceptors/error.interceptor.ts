import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';

// Tiempo máximo de espera por respuesta de cualquier microservicio (en ms).
// Útil en la nube, donde FastAPI o Spring Boot pueden tardar en responder bajo carga.
const HTTP_TIMEOUT_MS = 30_000; // 30 segundos

// Número de reintentos automáticos antes de propagar el error a la UI.
// Solo reintenta en cortes de red breves; no reintenta en errores 4xx/5xx del servidor.
const MAX_RETRIES = 1;

/**
 * Manejo global de errores HTTP con soporte para:
 * - Timeout de 30 segundos por petición (evita UI colgada en la nube).
 * - Reintento automático 1 vez en caso de micro-cortes de red.
 * - Cierre de sesión y redirección al login ante un error 401 Unauthorized.
 * - Mensajes de error descriptivos según el código HTTP.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      // Aplica el timeout a cada petición.
      timeout(HTTP_TIMEOUT_MS),
      // Reintenta la petición MAX_RETRIES veces ante fallos de red (no ante 4xx/5xx).
      retry(MAX_RETRIES),
      catchError((error: HttpErrorResponse | TimeoutError) => {
        // Error de timeout: el servidor no respondió a tiempo.
        if (error instanceof TimeoutError) {
          const timeoutError = new HttpErrorResponse({
            error: 'El servidor no respondió a tiempo. Por favor, intenta de nuevo.',
            status: 408,
            statusText: 'Request Timeout',
          });
          return throwError(() => timeoutError);
        }

        if (error instanceof HttpErrorResponse) {
          switch (error.status) {
            case 0:
              // Sin conexión al servidor (CORS o red caída).
              console.error('[ErrorInterceptor] Sin conexión al servidor:', error.url);
              break;

            case 401:
              // Token expirado o inválido — limpiar sesión y redirigir al login.
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              this.router.navigate(['/auth/login']);
              break;

            case 403:
              console.error('[ErrorInterceptor] Acceso prohibido (403):', error.url);
              break;

            case 500:
            case 502:
            case 503:
            case 504:
              console.error(
                `[ErrorInterceptor] Error del servidor (${error.status}):`,
                error.url
              );
              break;

            default:
              console.error(`[ErrorInterceptor] Error HTTP ${error.status}:`, error.message);
          }
        }

        return throwError(() => error);
      })
    );
  }
}
