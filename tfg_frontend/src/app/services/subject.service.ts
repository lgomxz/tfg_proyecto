import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { Subject } from '../models/subject';

@Injectable({
  providedIn: 'root',
})
export class SubjectService {
  private apiUrl = 'http://local.tfg.spa:3000/subject';

  constructor(private http: HttpClient) {}

  // Método para crear un nuevo Subject
  createSubject(subject: Subject): Observable<Subject> {
    return this.http.post<Subject>(this.apiUrl, subject);
  }

  updateSubject(id: string, updates: Partial<Subject>): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/${id}`, updates);
  }

  checkIfExists(id: string): Observable<{ exists: boolean }> {
    return this.http
      .get<{ exists: boolean }>(`${this.apiUrl}/${id}/exists`)
      .pipe(catchError(() => of({ exists: false })));
  }
  getBiologicalAgeAtDeath(
    shortId: string
  ): Observable<{ biological_age_at_death: number }> {
    return this.http.get<{ biological_age_at_death: number }>(
      `${this.apiUrl}/age-at-death/${shortId}`
    );
  }
}
