import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Role } from '../models/role';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesApiService {

  private baseUrl = 'http://local.tfg.spa:3000/roles'; 

  constructor(private http: HttpClient) { }

  // Método para obtener todos los roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/getAll`);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  getRoleName(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }


  
}
