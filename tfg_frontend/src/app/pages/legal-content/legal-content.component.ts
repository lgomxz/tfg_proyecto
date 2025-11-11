import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legal-content',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './legal-content.component.html',
  styleUrls: ['./legal-content.component.scss']
})
export class LegalContentComponent implements OnInit {
  content$: Observable<string> | undefined;
  selectedLanguage: string;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private translate: TranslateService
  ) {
    this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.translate.use(this.selectedLanguage);

    this.translate.onLangChange.subscribe(() => {
      this.loadLegalContent();
    });
  }

  ngOnInit(): void {
    this.loadLegalContent();
  }

  loadLegalContent(): void {
    this.content$ = this.route.paramMap.pipe(
      switchMap(params => {
        const contentType = params.get('type');
        if (!contentType) {
          throw new Error('Content type is missing in the URL');
        }
        const url = `assets/legal/${contentType}.html`;

        return this.http.get(url, { responseType: 'text' }).pipe(
          tap(htmlContent => console.log('Original HTML Content:', htmlContent)),
          switchMap((htmlContent: string) => this.translateHtmlContent(htmlContent))
        );
      })
    );
  }

  private translateHtmlContent(htmlContent: string): Observable<string> {
    const translationKeys = this.extractTranslationKeys(htmlContent);

    // Obtener las traducciones para todas las claves identificadas
    const translationRequests = translationKeys.map(key => this.translate.get(key));

    // Combinar todas las solicitudes de traducción en un solo observable
    return forkJoin(translationRequests).pipe(
      map(translations => {
        // Reemplazar cada clave de traducción con su respectiva traducción en el contenido HTML
        translationKeys.forEach((key, index) => {
          htmlContent = htmlContent.replace(`{{ '${key}' | translate }}`, translations[index]);
          htmlContent = htmlContent.replace(`[innerHTML]="'${key}' | translate"`, `innerHTML="${translations[index]}"`);
        });
        return htmlContent;
      })
    );
  }

  private extractTranslationKeys(htmlContent: string): string[] {
    const pattern = /{{\s*'(.*?)'\s*\|\s*translate\s*}}|\[innerHTML\]="'(.*?)'\s*\|\s*translate"/g;
    const matches = htmlContent.matchAll(pattern);
    return Array.from(matches, match => match[1] || match[2]);
  }
}
