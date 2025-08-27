import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NewPasswordService {
  private apiUrl = `${environment.apiUrl}/api/password`;

  constructor(private http: HttpClient) {}

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, { token, newPassword });
  }
} 