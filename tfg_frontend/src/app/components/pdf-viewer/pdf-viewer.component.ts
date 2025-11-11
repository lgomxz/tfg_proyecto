import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { PdfService } from '../../services/pdf.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-pdf-viewer',
  standalone: true,
  imports: [
    NgxExtendedPdfViewerModule,
    CommonModule,
    MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'], // <--- aquí
})
export class PdfViewerComponent implements OnInit {
  @Input() pdfFilename: string | undefined;
  @Output() back = new EventEmitter<void>();
  pdfSrc: string | undefined;

  constructor(private pdfService: PdfService) {}

  ngOnInit() {
    if (this.pdfFilename) {
      this.pdfSrc = `http://local.tfg.spa:3000/files/${this.pdfFilename}`;
    }
  }

  // Método para descargar un pdf
  downloadDoc() {
    this.pdfService.downloadPdf(this.pdfFilename!).subscribe(
      blob => {
        const url = window.URL.createObjectURL(blob);
        // Crea dinámicamente un enlace <a> para forzar la descarga del archivo
        const a = document.createElement('a');
        a.href = url;
        a.download = this.pdfFilename!;
        document.body.appendChild(a);
        a.click();

        // Limpieza del DOM y liberación de la URL temporal
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error => {
        console.error('Error descargando PDF:', error);
      }
    );
  }

  goBack() {
    this.back.emit();
  }
}
