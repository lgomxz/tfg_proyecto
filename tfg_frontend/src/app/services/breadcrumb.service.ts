// breadcrumb.service.ts
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';
import { CollectionApiService } from './collection-service.service';
import { PubisService } from './pubis.service';
import { TranslateService } from '@ngx-translate/core';

export interface BreadcrumbItem {
  label: string;
  url: string;
  i18nKey?: string; // para los labels traducibles
}

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private history: BreadcrumbItem[] = [];
  private breadcrumbSubject = new BehaviorSubject<BreadcrumbItem[]>([]);
  breadcrumbs$ = this.breadcrumbSubject.asObservable();

  private isBrowser = typeof window !== 'undefined' && !!window.sessionStorage;
  private collectionNameCache: Record<string, string> = {};
  private pubisNameCache: Record<string, string> = {};
  private currentCollectionId: string | null = null;
  private currentCollectionName: string | null = null;

  constructor(
    private router: Router,
    private collectionApiService: CollectionApiService,
    private pubisService: PubisService,
    private translate: TranslateService
  ) {
    if (this.isBrowser) {
      const storedHistory = sessionStorage.getItem('breadcrumbHistory');
      if (storedHistory) {
        this.history = JSON.parse(storedHistory);
        this.breadcrumbSubject.next(this.history);
      }
      this.currentCollectionId = sessionStorage.getItem('currentCollectionId');
      this.currentCollectionName = sessionStorage.getItem(
        'currentCollectionName'
      );
    }

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.addToHistory(url);
      });

    // Traduce al instante al cambiar idioma
    this.translate.onLangChange.subscribe(() => {
      this.refreshLabels();
    });
  }

  private async addToHistory(url: string) {
    const pathOnly = url.split('?')[0];
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const shortId = urlParams.get('shortId');
    const parts = pathOnly.split('/').filter(p => p.length > 0);

    // Colección
    if (parts[0] === 'pubis' && parts.length === 1 && shortId) {
      const name = await this.fetchCollectionName(shortId);
      if (name) {
        this.currentCollectionId = shortId;
        this.currentCollectionName = name;

        // Actualizar breadcrumb inmediato
        this.history = [
          {
            label: name,
            url: `/pubis?shortId=${shortId}`,
          },
        ];

        if (this.isBrowser) {
          sessionStorage.setItem('currentCollectionId', shortId);
          sessionStorage.setItem('currentCollectionName', name);
        }
        this.persistAndEmit();
        return;
      }
    }

    // Pubis dentro de colección
    if (parts[0] === 'pubis' && parts[1] === 'labelling' && shortId) {
      if (this.currentCollectionId && this.currentCollectionName) {
        const baseHistory: BreadcrumbItem[] = [
          {
            label: this.currentCollectionName,
            url: `/pubis?shortId=${this.currentCollectionId}`,
          },
        ];
        const pubisName = await this.fetchPubisName(shortId);
        baseHistory.push({
          label: pubisName || shortId,
          url,
        });
        this.history = baseHistory;
        this.persistAndEmit();
        return;
      }
    }

    // Flujo estándar
    await this.addStandard(url);
  }

  private async addStandard(url: string) {
    const parts = url
      .split('?')[0]
      .split('/')
      .filter(p => p.length > 0);
    const newHistory: BreadcrumbItem[] = [];

    let accumulatedBase = '';
    for (let i = 0; i < parts.length; i++) {
      accumulatedBase += '/' + parts[i];
      const urlToLabel = i === parts.length - 1 ? url : accumulatedBase;
      const { label, key } = await this.getStaticLabel(parts[i]);
      newHistory.push({ label, url: urlToLabel, i18nKey: key });
    }

    this.history = newHistory;
    this.persistAndEmit();
  }

  private formatLabel(segment: string): string {
    return segment.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
  }

  private async getStaticLabel(
    segment: string
  ): Promise<{ label: string; key?: string }> {
    let key: string | undefined;

    switch (segment) {
      case 'labelling':
        key = 'BREADCRUMBS.LABELLING';
        break;
      case 'profile':
        key = 'BREADCRUMBS.PROFILE';
        break;
      case 'training-tool':
        key = 'BREADCRUMBS.TRAINING_TOOL';
        break;
      case 'documentation':
        key = 'BREADCRUMBS.DOCUMENTATION';
        break;
      case 'estimate-ai':
        key = 'BREADCRUMBS.ESTIMATE_AI';
        break;
      case 'single-sample':
        key = 'BREADCRUMBS.SINGLE_SAMPLE';
        break;
      case 'multiple-samples':
        key = 'BREADCRUMBS.MULTIPLE_SAMPLES';
        break;
      case 'experiments':
        key = 'BREADCRUMBS.EXPERIMENTS';
        break;
      case 'users-center':
        key = 'BREADCRUMBS.USERS';
        break;
    }

    if (key) {
      const label = await firstValueFrom(this.translate.get(key));
      return { label, key };
    } else {
      return { label: this.formatLabel(segment) };
    }
  }

  private async fetchCollectionName(
    shortId: string | null
  ): Promise<string | null> {
    if (!shortId) return null;
    if (this.collectionNameCache[shortId])
      return this.collectionNameCache[shortId];

    try {
      const collection = await firstValueFrom(
        this.collectionApiService.getByShortId(shortId)
      );
      const name = (collection && (collection as any).name) || null;
      if (name) this.collectionNameCache[shortId] = name;
      return name;
    } catch (err) {
      console.error('Error al obtener nombre de colección:', err);
      return null;
    }
  }

  private async fetchPubisName(shortId: string | null): Promise<string | null> {
    if (!shortId) return null;
    if (this.pubisNameCache[shortId]) return this.pubisNameCache[shortId];

    try {
      const pubis = await firstValueFrom(
        this.pubisService.getByShortId(shortId)
      );
      const name =
        (pubis && ((pubis as any).name || (pubis as any).shortId)) || null;
      if (name) this.pubisNameCache[shortId] = name;
      return name;
    } catch (err) {
      console.error('Error al obtener nombre de pubis:', err);
      return null;
    }
  }

  private persistAndEmit() {
    this.breadcrumbSubject.next([...this.history]); // clonamos para detectar cambios
    if (this.isBrowser) {
      sessionStorage.setItem('breadcrumbHistory', JSON.stringify(this.history));
    }
  }

  private async refreshLabels() {
    for (let i = 0; i < this.history.length; i++) {
      const item = this.history[i];
      if (item.i18nKey) {
        const label = await firstValueFrom(this.translate.get(item.i18nKey));
        item.label = label;
      }
    }
    this.breadcrumbSubject.next([...this.history]);
  }

  clearHistory() {
    this.history = [];
    this.breadcrumbSubject.next([]);
    if (this.isBrowser) {
      sessionStorage.removeItem('breadcrumbHistory');
      sessionStorage.removeItem('currentCollectionId');
      sessionStorage.removeItem('currentCollectionName');
    }
  }
}
