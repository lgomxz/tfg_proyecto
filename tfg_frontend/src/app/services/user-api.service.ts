import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private baseUrl = 'http://local.tfg.spa:3000/user';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getAccepted`);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/getById/${id}`, {});
  }

  getAcceptedUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getAccepted`);
  }

  getPendingUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getPending`);
  }

  approveUser(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/approve/${id}`, {});
  }

  registerUser(user: User): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, user, {
      observe: 'response',
    });
  }

  getUserDescriptionById(id: string): Observable<{ description: string }> {
    return this.http.get<{ description: string }>(
      `${this.baseUrl}/getDescriptionById/${id}`
    );
  }

  getUserEmailById(id: string): Observable<{ email: string }> {
    return this.http.get<{ email: string }>(
      `${this.baseUrl}/getUserEmailById/${id}`
    );
  }

  declineUserById(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/reject/${id}`);
  }

  setRole(userId: string, roleId: string): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${userId}/role`, { roleId });
  }

  getRoleIdByEmail(email: string): Observable<{ roleId: string }> {
    return this.http.get<{ roleId: string }>(
      `${this.baseUrl}/role-id?email=${email}`
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, userData);
  }

  sendEmail(emailData: {
    from: string;
    subject: string;
    body: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/send-email`, emailData).pipe(
      tap(response => {
        console.log('Email enviado:', response);
      }),
      catchError(error => {
        console.error('Error al enviar el correo:', error);
        return throwError(error);
      })
    );
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/getByEmail/${email}`);
  }

  getUserPhotoUrlById(id: string): Observable<{ photoUrl: string | null }> {
    return this.http.get<{ photoUrl: string | null }>(
      `${this.baseUrl}/${id}/photo`
    );
  }

  uploadUserPhoto(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/${userId}/photo`, formData);
  }
}
