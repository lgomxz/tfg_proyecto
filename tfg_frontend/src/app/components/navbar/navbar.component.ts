import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { UserApiService } from '../../services/user-api.service';
import { RolesApiService } from '../../services/roles-api.service';
import { User } from '../../models/user';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

interface Language {
  name: string;
  code: string;
}

@UntilDestroy()
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DropdownModule,
    FormsModule,
    BadgeModule,
    AvatarModule,
    TranslateModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  private isMobileView: boolean = false;
  subMenu: HTMLElement | null = null;
  isLoggedIn$?: Observable<boolean>;
  menuOpened: boolean = false;
  showMenu: boolean = false;
  submenuOpened: boolean = false;
  currentRoute: string = '';
  hiddenNavbarRoutes: string[] = ['/pubis-data'];
  showNavbar$?: Observable<boolean>;
  userMenuOpened = false;
  imageUrl: string | null = null;

  emailUser: string | undefined;
  user!: User;
  showAdminButtons: boolean = false;

  languages: Language[] = [
    { name: 'Spanish', code: 'es' },
    { name: 'English', code: 'en' },
  ];

  selectedLanguage: Language = this.languages.find(l => l.code === 'en')!;

  constructor(
    private authApiService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private userApiService: UserApiService,
    private rolesService: RolesApiService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  async ngOnInit(): Promise<void> {
    // SOLO ejecutar en navegador
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileView = window.innerWidth < 992;
      this.subMenu = document.getElementById('infoWrap');
    }

    this.isLoggedIn$ = this.authApiService.isLoggedIn;

    // Cierra el menú al cambiar de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.menuOpened = false;
        this.cdr.detectChanges();
      });

    // Control de visibilidad del navbar
    this.showNavbar$ = combineLatest([
      this.isLoggedIn$,
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.router.url)
      ),
    ]).pipe(
      map(([isLoggedIn, currentUrl]) => {
        return isLoggedIn && !this.hiddenNavbarRoutes.includes(currentUrl);
      })
    );

    // Si el usuario está autenticado
    this.isLoggedIn$.pipe(untilDestroyed(this)).subscribe(async isLoggedIn => {
      if (!isLoggedIn) return;

      try {
        this.emailUser =
          (await this.authApiService.getUserEmail().toPromise()) ||
          'default@example.com';

        const userData = await this.userApiService
          .getUserByEmail(this.emailUser)
          .toPromise();

        if (userData?.id) {
          this.userApiService
            .getUserPhotoUrlById(userData.id)
            .pipe(untilDestroyed(this))
            .subscribe(response => {
              const photoUrl = response.photoUrl;
              this.imageUrl = photoUrl ?? '../../assets/img/default.jpg';
            });
        }

        const roleResponse = await this.userApiService
          .getRoleIdByEmail(this.emailUser)
          .toPromise();

        const roleId = roleResponse!.roleId;

        this.rolesService
          .getRoleById(roleId)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: role => {
              if (role.name.toLowerCase() === 'admin') {
                this.showAdminButtons = true;
              }
            },
            error: error => {
              console.error('Error fetching role name:', error);
            },
          });
      } catch (error) {
        console.error('Error en la carga de datos del usuario:', error);
      }
    });

    // Configuración de idioma (solo navegador)
    if (isPlatformBrowser(this.platformId)) {
      const storedLanguage = localStorage.getItem('selectedLanguage') || 'en';
      this.selectedLanguage =
        this.languages.find(l => l.code === storedLanguage) ||
        this.languages[0];
      this.translate.setDefaultLang(this.selectedLanguage.code);
      this.translate.use(this.selectedLanguage.code);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Si el click no fue dentro del menú de usuario ni en el icono que lo abre → cerrar
    if (
      this.userMenuOpened &&
      !target.closest('.userInfo') && // el botón que abre
      !target.closest('.userInfoWrap') // el menú desplegable
    ) {
      this.closeUserMenu();
      this.cdr.detectChanges(); // forzar actualización de vista
    }
  }

  isNavbarVisible(): boolean {
    return !this.hiddenNavbarRoutes.includes(this.router.url);
  }

  toggleSidemenu() {
    if (this.menuOpened) {
      this.menuOpened = false;
      setTimeout(() => {
        this.showMenu = false;
      }, 100);
    } else {
      this.menuOpened = true;
      this.showMenu = true;
    }
  }

  toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }

  toggleSubmenu() {
    this.submenuOpened = !this.submenuOpened;
  }

  isActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'exact',
      matrixParams: 'ignored',
      queryParams: 'ignored',
      fragment: 'ignored',
    });
  }

  toggleUserMenu() {
    this.userMenuOpened = !this.userMenuOpened;
  }

  closeUserMenu() {
    this.userMenuOpened = false;
  }

  getFlagUrl(code: string | undefined): string {
    if (code === 'en') code = 'gb';
    return `https://flagcdn.com/w80/${code}.png`;
  }

  onCountryChange(event: any) {
    this.selectedLanguage = event.value;
    this.translate.use(this.selectedLanguage.code);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('selectedLanguage', this.selectedLanguage.code);
    }
  }

  logout(): void {
    this.authApiService.logout();
    this.menuOpened = false;
  }

  @HostListener('window:resize', [])
  onResize() {
    if (!isPlatformBrowser(this.platformId)) return;

    const isNowMobile = window.innerWidth < 1400;

    if (this.isMobileView !== isNowMobile) {
      this.menuOpened = false;
      this.showMenu = false;
      this.userMenuOpened = false;
      this.submenuOpened = false;
      this.cdr.detectChanges();
    }

    this.isMobileView = isNowMobile;
  }
}
