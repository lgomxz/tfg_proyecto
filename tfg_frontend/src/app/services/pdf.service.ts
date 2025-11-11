import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  private baseUrl = 'http://local.tfg.spa:3000/documentation'; 

  constructor(private http: HttpClient) {}

  downloadPdf(pdfFilename: string): Observable<Blob> {
    console.log('Calling downloadPdf');
    return this.http.get(`${this.baseUrl}/download/${pdfFilename}`, {
      responseType: 'blob',
    });
  }
}
