import { Component, OnDestroy, OnInit } from '@angular/core';
import { Pubis } from '../../models/pubis';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pubis-data',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './pubis-data.component.html',
  styleUrl: './pubis-data.component.scss',
})
export class PubisDataComponent implements OnInit, OnDestroy {
  pubisObj: Pubis | null = null;
  loading = true;

  /** Referencia al handler para poder quitarlo */
  private messageHandler = (e: MessageEvent) => {
    if (e.origin !== window.location.origin) return;

    // Establece los datos recibidos en el componente
    this.pubisObj = e.data;
    this.loading = false;

    (e.source as WindowProxy)?.postMessage('ACK_PUBIS', e.origin);

    // Guarda los datos en sessionStorage para persistir en futuras recargas
    sessionStorage.setItem('pubisData', JSON.stringify(e.data));
  };

  ngOnInit(): void {
    // Verificar si ya hay datos en sessionStorage
    const storedData = sessionStorage.getItem('pubisData');
    if (storedData) {
      this.pubisObj = JSON.parse(storedData);
      this.loading = false;
    } else {
      // Si no hay datos almacenados, pedimos al padre que los envíe
      if (window.opener) {
        window.opener.postMessage('REQUEST_PUBIS', window.location.origin);
      }
    }

    // Añadir el listener para recibir mensajes del padre
    window.addEventListener('message', this.messageHandler);
  }

  get acquisitionYear(): string {
    const raw = this.pubisObj?.subject?.acquisition_year;
    if (!raw) return '';

    const d = new Date(raw);
    return isNaN(+d) ? String(raw) : d.getFullYear().toString();
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageHandler);
  }
}
