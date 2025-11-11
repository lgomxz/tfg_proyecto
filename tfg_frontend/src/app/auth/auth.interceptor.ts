import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = sessionStorage.getItem('auth_token');
    
    if (token && !this.authService.isTokenExpired(token)) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.warn('Interceptado error 401, cerrando sesión...');
            this.authService.logout(); // Cerrar sesión si el token es inválido
          }
          return throwError(() => error); // Lanzar error para que se maneje por la lógica de error
        })
      );
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('Interceptado error 401, cerrando sesión...');
          this.authService.logout(); // Cerrar sesión si no hay token
        }
        return throwError(() => error); // Lanzar error para que se maneje por la lógica de error
      })
    );
  }
}
