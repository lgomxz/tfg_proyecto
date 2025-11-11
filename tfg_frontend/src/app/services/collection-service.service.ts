import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Collection } from '../models/collection';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollectionApiService {

  private baseUrl = 'http://local.tfg.spa:3000/collections'; 

  constructor(private http: HttpClient) { }

  // Método para obtener todos las colecciones
  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.baseUrl}/getAll`);
  }

  getById(id: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.baseUrl}/getById/${id}`, {})
  }

  
  // Método para crear una nueva colección
  createCollection(collection: Collection): Observable<Collection> {
    return this.http.post<Collection>(`${this.baseUrl}/create`, collection);
  }

  // Método para eliminar una colección
  deleteCollection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  // Método para editar una colección
  editCollection(collection: Collection): Observable<Collection> {
    return this.http.put<Collection>(`${this.baseUrl}/edit`, collection);
  }

  getCollectionName(id: string): Observable<{ name: string }> {
    return this.http.get<{ name: string }>(`${this.baseUrl}/getName/${id}`);
  }

  getByShortId(shortId: string): Observable<Collection> {
    return this.http.get<Collection>(`${this.baseUrl}/getByShortId/${shortId}`);
  }
  

}
