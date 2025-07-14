import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ForgotPasswordService {
  private apiUrl = environment.apiUrl + '/api/password';

  constructor(private http: HttpClient) {}

  forgotPassword(identifier: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot`, { identifier });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, { token, newPassword });
  }
} 