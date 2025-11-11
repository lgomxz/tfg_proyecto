import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Label, LabelWitPubis } from '../models/label';

@Injectable({
  providedIn: 'root',
})
export class LabellingService {
  private apiUrl = 'http://local.tfg.spa:3000/label';

  constructor(private http: HttpClient) {}

  createLabel(lbl: LabelWitPubis): Observable<LabelWitPubis> {
    return this.http.post<LabelWitPubis>(`${this.apiUrl}/create`, lbl);
  }

  getLabelsById(id: string): Observable<Label> {
    return this.http.get<Label>(`${this.apiUrl}/getLabels/${id}`);
  }

  getLabelsByShortId(shortId: string): Observable<Label> {
    return this.http.get<Label>(`${this.apiUrl}/getShortLabels/${shortId}`);
  }

  createFileARFF(id: string | string[]): Observable<{
    prediction: { labelId: string; prediction: string | null }[];
  }> {
    return this.http.post<{
      prediction: { labelId: string; prediction: string | null }[];
    }>(`${this.apiUrl}/createARFF`, { id });
  }

  estimateAge(
    labelId: string | string[]
  ): Observable<{ results: { labelId: string; age: number | null }[] }> {
    return this.http.post<{
      results: { labelId: string; age: number | null }[];
    }>(`${this.apiUrl}/estimateAge`, { id: labelId });
  }
}
