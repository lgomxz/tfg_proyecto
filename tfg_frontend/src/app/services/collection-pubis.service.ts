import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CollectionPubis } from '../models/collection-pubis';

@Injectable({
  providedIn: 'root',
})
export class CollectionPubisService {
  private apiUrl = 'http://local.tfg.spa:3000/collection-pubis';
  constructor(private http: HttpClient) {}

  createRelation(
    collectionId: string,
    pubisId: string
  ): Observable<CollectionPubis> {
    const relation = { collectionId, pubisId };
    console.log('Sending relation:', relation);
    return this.http.post<CollectionPubis>(`${this.apiUrl}/create`, relation);
  }
}
