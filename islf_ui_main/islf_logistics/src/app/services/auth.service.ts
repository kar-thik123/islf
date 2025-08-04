import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private loginService: LoginService) {
    // Check initial authentication state
    this.checkAuthState();
  }

  checkAuthState(): void {
    const token = this.loginService.getToken();
    const isAuthenticated = !!token;
    this.isAuthenticatedSubject.next(isAuthenticated);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  login(token: string, name: string, rememberMe: boolean): void {
    this.loginService.setToken(token, rememberMe);
    this.loginService.setUserName(name, rememberMe);
    this.isAuthenticatedSubject.next(true);
  }

  logout(): void {
    this.loginService.logout();
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return this.loginService.getToken();
  }

  getUserName(): string | null {
    return this.loginService.getUserName();
  }
} 