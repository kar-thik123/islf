import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginService } from './login.service';
import { ContextService } from './context.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private loginService: LoginService, private contextService: ContextService) {
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
    console.log('User logged in, setting auth state to true');
    this.isAuthenticatedSubject.next(true);
  }

  logout(preserveUsername: boolean = false): void {
    this.loginService.logout(preserveUsername);
    this.contextService.clearContext();
    this.contextService.hideContextSelector();
    console.log('User logged out, setting auth state to false');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return this.loginService.getToken();
  }

  getUserName(): string | null {
    return this.loginService.getUserName();
  }
} 