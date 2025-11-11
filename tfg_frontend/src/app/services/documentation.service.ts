import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentationService {
  private readonly baseUrl = 'http://local.tfg.spa:3000/documentation';

  constructor(private http: HttpClient) {}

  listDocuments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/list`);
  }

  uploadDocument(file: File): Observable<{ status: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ status: string; message: string }>(
      `${this.baseUrl}/upload`,
      formData
    );
  }

  deleteDocument(
    filename: string
  ): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(
      `${this.baseUrl}/delete/${filename}`
    );
  }
}
