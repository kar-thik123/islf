import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = `${environment.apiUrl}/api/auth`;

  constructor(private http: HttpClient) {}

  login(identifier: string, password: string): Observable<{ token: string, name?: string }> {
    return this.http.post<{ token: string, name?: string }>(`${this.apiUrl}/login`, { identifier, password });
  }

  setToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('jwt_token', token);
      sessionStorage.removeItem('jwt_token');
    } else {
      sessionStorage.setItem('jwt_token', token);
      localStorage.removeItem('jwt_token');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  }

  setUserName(name: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('user_name', name);
      sessionStorage.removeItem('user_name');
    } else {
      sessionStorage.setItem('user_name', name);
      localStorage.removeItem('user_name');
    }
  }

  getUserName(): string | null {
    return localStorage.getItem('user_name') || sessionStorage.getItem('user_name');
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_name');
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user_name');
  }

  verifyPassword(username: string, password: string) {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/verify-password`, { username, password });
  }
} 