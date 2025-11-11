import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PubisLabel } from '../models/pubis-label.model';
import { Observable } from 'rxjs';



interface LabelsByPubisIdsDto {
  pubisIds: string[];
  userId?: string;
}

@Injectable({ providedIn: 'root'})
export class PubisLabelService {
  private apiUrl = 'http://local.tfg.spa:3000/pubis-label'; 
  constructor(private http: HttpClient) { }

  getTrainingHistoryByUser(userId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/training-history/${userId}`);
  }

  getLabelsByPubisIds(pubisIds: string[], userId: string | null): Observable<PubisLabel[]> {
    const body: LabelsByPubisIdsDto = {
      pubisIds,
      ...(userId && { userId })
    };
    return this.http.post<PubisLabel[]>(`${this.apiUrl}/by-pubis-ids`, body);
  }

}
