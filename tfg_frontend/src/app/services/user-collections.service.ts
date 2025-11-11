import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Collection } from '../models/collection';

@Injectable({ providedIn: 'root' })
export class UserCollectionsService {
  private apiUrl = 'http://local.tfg.spa:3000/user-collections';

  constructor(private http: HttpClient) {}

  // Obtener colecciones asignadas a un usuario
  getCollectionsByUserId(userId: string): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.apiUrl}/${userId}/collections`);
  }

  assignCollectionsToUsers(userIds: string[], collectionIds: string[]): Observable<{ message: string }> {
    const body = { userIds, collectionIds };
    return this.http.post<{ message: string }>(`${this.apiUrl}/assign-collections`, body);
  }


}
