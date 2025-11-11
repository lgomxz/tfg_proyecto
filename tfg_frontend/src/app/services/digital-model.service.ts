import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DigitalModel } from '../models/digital-model';

@Injectable({
  providedIn: 'root',
})
export class DigitalModelService {
  private apiUrl = 'http://local.tfg.spa:3000/digital-model';

  constructor(private http: HttpClient) {}

  // Crea un modelo digital
  createDigitalModel(model: DigitalModel): Observable<DigitalModel> {
    return this.http.post<DigitalModel>(this.apiUrl, model);
  }

  // Obtiene modelos digitales de un pubis
  getByPubisId(pubisId: string): Observable<DigitalModel[]> {
    return this.http.get<DigitalModel[]>(`${this.apiUrl}/pubis/${pubisId}`);
  }
}
