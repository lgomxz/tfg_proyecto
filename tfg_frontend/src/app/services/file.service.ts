import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MyFile } from '../models/file';


@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'http://local.tfg.spa:3000/file';

  constructor(private http: HttpClient) {}

  // Método para crear un archivo en el servidor
  createFile(fileData: Partial<MyFile>): Observable<MyFile> {
    return this.http.post<MyFile>(`${this.apiUrl}`, fileData);
  }


}
