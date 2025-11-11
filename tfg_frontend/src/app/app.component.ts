import { MoveDirection, OutMode } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { NgParticlesService, NgxParticlesModule } from '@tsparticles/angular';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { AuthService } from './services/auth.service';
import { SpinnerLoaderComponent } from './components/spinner-loader/spinner-loader.component';
import { LoadingService } from './services/loading.service';
import {
  BreadcrumbItem,
  BreadcrumbService,
} from './services/breadcrumb.service';
import { ChangeDetectorRef } from '@angular/core';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NgxParticlesModule,
    NavbarComponent,
    FooterComponent,
    BreadcrumbComponent,
    SpinnerLoaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  items: BreadcrumbItem[] = [];
  showBreadcrumb = true;

  title = 'tfg_project';
  id = 'tsparticles';

  particlesUrl = 'http://foo.bar/particles.json';

  particlesOptions = {
    background: {
      color: {
        value: '#ffffff',
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
        },
        onHover: {
          enable: true,
        },
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: '#0000ff',
      },
      links: {
        color: '#000000',
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: MoveDirection.none,
        enable: true,
        outModes: {
          default: OutMode.bounce,
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  constructor(
    private readonly ngParticlesService: NgParticlesService,
    private router: Router,
    private authService: AuthService,
    private loadingService: LoadingService,
    private breadcrumbService: BreadcrumbService,
    private cdr: ChangeDetectorRef
  ) {
    // Actualizar breadcrumbs
    this.breadcrumbService.breadcrumbs$.subscribe(items => {
      console.log('[AppComponent] Breadcrumbs actualizados:', items);
      this.items = items;
    });

    // Ocultar breadcrumb en rutas específicas
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Lista de rutas donde NO se muestra el breadcrumb
        const hiddenRoutes = ['pubis-data'];
        this.showBreadcrumb = !hiddenRoutes.some(route =>
          event.urlAfterRedirects.includes(route)
        );
        this.cdr.detectChanges();
      });
  }

  isAuthChecked$ = this.authService.isAuthChecked$;

  ngOnInit(): void {
    // Inicializar partículas
    this.ngParticlesService.init(async engine => {
      await loadSlim(engine);
    });
  }
}
