import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private uploadUrl = 'http://local.tfg.spa:3000/upload';

  constructor(private http: HttpClient) {}

  uploadFiles(
    files: File[],
    is3D: boolean,
    relativePaths: string[],
    createdSubjectId: string
  ): Observable<any> {
    const formData = new FormData();

    // Añadir los archivos al FormData
    for (const file of files) {
      formData.append('files', file);
    }

    // Añadir el flag is3D al FormData
    formData.append('is3D', is3D.toString());

    // Añadir las rutas relativas al FormData
    relativePaths.forEach(path => {
      formData.append('relativePaths', path);
    });

    formData.append('createdSubjectId', createdSubjectId);

    return this.http.post(this.uploadUrl, formData);
  }

  deleteFile(fileId: string): Observable<void> {
    return this.http.delete<void>(`${this.uploadUrl}/${fileId}`);
  }
}
