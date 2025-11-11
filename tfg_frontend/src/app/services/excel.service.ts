import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  private apiUrl = 'http://local.tfg.spa:3000/excel'; // URL base de tu backend

  constructor(private http: HttpClient) {}

  downloadExcel(
    data: { labelId: string; prediction: string; estimatedAge?: string }[]
  ): void {
    this.http
      .post(`${this.apiUrl}/download`, data, {
        responseType: 'blob', // Para recibir archivo binario
      })
      .subscribe(
        blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'predictions.xlsx';
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error => {
          console.error('Error descargando Excel', error);
        }
      );
  }
}
