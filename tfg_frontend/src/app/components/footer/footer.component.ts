import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, combineLatest } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  // Observable que representa si el usuario está autenticado
  isLoggedIn$?: Observable<boolean>;
  showFooter$?: Observable<boolean>;

  // Lista de rutas donde el footer debe ocultarse
  hiddenFooterRoutes: string[] = ['/pubis-data'];

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  // Configuración de los observables para controlar la visibilidad del footer
  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn;

    // Combina el estado de autenticación y la visibilidad del footer según la ruta actual
    this.showFooter$ = combineLatest([
      this.isLoggedIn$,
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url)
      ),
    ]).pipe(
      map(([isLoggedIn, currentUrl]) => {
        // El footer se mostrará solo si está autenticado y la ruta no está en las ocultas
        return isLoggedIn && !this.hiddenFooterRoutes.includes(currentUrl);
      })
    );

    // Detecta cambios cuando el estado de autenticación cambia
    this.isLoggedIn$.subscribe(logged => {
      if (logged) {
        this.cdr.detectChanges();
      }
    });
  }
}
