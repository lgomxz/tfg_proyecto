import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pubis } from '../models/pubis';
import { FilesByModelType } from '../models/file';

@Injectable({
  providedIn: 'root',
})
export class PubisService {
  private apiUrl = 'http://local.tfg.spa:3000/pubis';
  constructor(private http: HttpClient) {}

  createPubis(pubis: Pubis): Observable<Pubis> {
    return this.http.post<Pubis>(`${this.apiUrl}`, pubis);
  }

  getAllPubis(): Observable<Pubis[]> {
    return this.http.get<Pubis[]>(`${this.apiUrl}/getAll`);
  }

  updatePubis(id: string, updates: Partial<Pubis>): Observable<Pubis> {
    return this.http.put<Pubis>(`${this.apiUrl}/${id}`, updates);
  }

  getPubisByCollection(collectionId: string | null): Observable<Pubis[]> {
    return this.http.get<Pubis[]>(
      `${this.apiUrl}/getByCollection/${collectionId}`
    );
  }

  getFilesByPubisId(pubisId: string): Observable<FilesByModelType> {
    return this.http.get<FilesByModelType>(
      `${this.apiUrl}/getFiles/${pubisId}`
    );
  }

  getByShortId(shortId: string): Observable<Pubis> {
    return this.http.get<Pubis>(`${this.apiUrl}/getByShortId/${shortId}`);
  }

  getLabeledPubis(): Observable<Pubis[]> {
    return this.http.get<Pubis[]>(`${this.apiUrl}/allLabeled`);
  }

  getLabeledPubisByID(pubisId: string): Observable<Pubis[]> {
    return this.http.get<Pubis[]>(`${this.apiUrl}/labels/${pubisId}`);
  }

  getRandomLabeledPubis(): Observable<Pubis> {
    return this.http.get<Pubis>(`${this.apiUrl}/random`);
  }

  getLabelModes(pubisId: string): Observable<Record<string, string[]>> {
    return this.http.get<Record<string, string[]>>(
      `${this.apiUrl}/labelModes/${pubisId}`
    );
  }

  getSubjectShortIdByPubisShortId(
    pubisShortId: string
  ): Observable<{ subjectShortId: string }> {
    return this.http.get<{ subjectShortId: string }>(
      `${this.apiUrl}/${pubisShortId}/subject-short-id`
    );
  }
  deletePubis(pubisId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${pubisId}`);
  }
}
