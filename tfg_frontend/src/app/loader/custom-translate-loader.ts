import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    // Lista de archivos de traducción a cargar
    const translationFiles = [
      'navbar',
      'cookies_policy',
      'legal_notice',
      'privacy_policy',
      'support',
      'components',
      'profile',
      'pubis_viewer',
      'pubis_data',
      'training_history',
      'breadcrumbs',
      'experiments',
      'estimation',
    ];
    const requests = translationFiles.map(file =>
      this.http.get(`./assets/i18n/${lang}/${file}.json`)
    );

    // Combina todas las traducciones en un solo objeto
    return forkJoin(requests).pipe(
      map(responseList => {
        return responseList.reduce((acc, curr) => {
          return { ...acc, ...curr };
        }, {});
      })
    );
  }
}
