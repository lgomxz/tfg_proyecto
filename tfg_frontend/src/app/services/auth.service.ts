import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = 'http://local.tfg.spa:3000/auth';
  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private isAuthChecked: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get isAuthChecked$(): Observable<boolean> {
    return this.isAuthChecked.asObservable();
  }

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {
    this.checkAuthentication();
  }

  login(credentials: {
    email: string;
    password: string;
    rememberMe: boolean;
  }): Observable<any> {
    return this.http
      .post<any>(`${this.baseUrl}/login`, credentials, {
        withCredentials: false,
      })
      .pipe(
        tap(response => {
          if (response.token && isPlatformBrowser(this.platformId)) {
            // Solo accede a sessionStorage si está en el navegador
            sessionStorage.setItem('auth_token', response.token);
            this.loggedIn.next(true);
          }
        }),
        catchError(error => {
          console.error('Error al iniciar sesión:', error);
          return throwError(error);
        })
      );
  }

  checkAuthentication(): void {
    // Solo accedemos a sessionStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        this.loggedIn.next(true);
      } else {
        this.loggedIn.next(false);
      }

      // Añadimos un pequeño retraso antes de emitir 'true' para dar tiempo al spinner
      this.isAuthChecked.next(false); // Inicializamos a false primero
      setTimeout(() => {
        this.isAuthChecked.next(true);
      }, 500); // Esperamos 500ms (puedes ajustar el tiempo si es necesario)
    }
  }

  // Obtiene el email del usuario
  getUserEmail(): Observable<string | null> {
    const token = sessionStorage.getItem('auth_token');
    return this.http
      .get<{ email: string }>(`${this.baseUrl}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envia token en el encabezado
        },
      })
      .pipe(
        map(response => response.email || null) // Extrae solo el email o devolver null si no existe
      );
  }

  getUserId(): Observable<string | null> {
    const token = sessionStorage.getItem('auth_token');
    return this.http
      .get<{ id: string }>(`${this.baseUrl}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`, // Envia token en el encabezado
        },
      })
      .pipe(
        map(response => response.id || null),
        tap(response => console.log('Response:', response))
      );
  }

  logout(): void {
    this.loggedIn.next(false);

    if (isPlatformBrowser(this.platformId)) {
      // Elimina el token de sessionStorage solo si está en el navegador
      sessionStorage.removeItem('auth_token');
    }
    this.router.navigate(['/login']);
  }

  // Verifica si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.loggedIn.value;
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  // Restablecer la contraseña
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password/${token}`, {
      newPassword,
    });
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeJwt(token);
    if (!decoded || !decoded.exp) {
      return true; // Si no tiene una fecha de expiración, consideramos que ha expirado.
    }
    const expiryDate = new Date(decoded.exp * 1000); // Convertimos el tiempo de expiración a milisegundos
    return expiryDate < new Date(); // Si la fecha de expiración ya pasó, el token está expirado
  }

  // Decodificar el JWT
  private decodeJwt(token: string): any {
    const payload = token.split('.')[1]; // Obtener el payload del token
    const decodedPayload = atob(payload); // Decodificar el payload base64
    return JSON.parse(decodedPayload);
  }
}
