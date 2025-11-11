import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Método principal del guard: determina si una ruta puede ser activada.
  canActivate(): Observable<boolean> {
    this.authService.checkAuthentication();
    return this.authService.isLoggedIn.pipe(
      take(1), // Solo toma el primer valor emitido (evita múltiples suscripciones)
      map((isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          this.router.navigate(['/login']);  // Redirige al login
          return false;
        }
        return true;
      })
    );
  }
}
