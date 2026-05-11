import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { LoginService } from './login.service';
import { ContextService } from './context.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private isReadySubject = new ReplaySubject<boolean>(1);
  public isReady$ = this.isReadySubject.asObservable();

  public isLoggingOut = false;
  private userService = inject(UserService);

  constructor(private loginService: LoginService, private contextService: ContextService) {
    // Check initial authentication state
    this.checkAuthState();
  }

  checkAuthState(): void {
    const token = this.loginService.getToken();
    const isAuthenticated = !!token;
    this.isAuthenticatedSubject.next(isAuthenticated);
    this.isReadySubject.next(true); // Signal readiness after initial check
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  logout(preserveUsername: boolean = false): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;

    console.log('User logout initiated...');

    // Clear context first so any remaining component reloads have a token but no context
    this.contextService.clearContext();
    this.contextService.hideContextSelector();

    // Clear user profile cache on logout
    this.userService.clearProfileCache();

    // Then clear the token
    this.loginService.logout(preserveUsername);

    console.log('User logged out, setting auth state to false');
    this.isAuthenticatedSubject.next(false);

    // Reset the flag after a short delay to allow navigation to settle
    setTimeout(() => {
      this.isLoggingOut = false;
    }, 1000);
  }

  login(token: string, name: string, rememberMe: boolean): void {
    this.isLoggingOut = false;
    this.userService.clearProfileCache(); // Ensure fresh profile on login
    this.loginService.setToken(token, rememberMe);
    this.loginService.setUserName(name, rememberMe);
    console.log('User logged in, setting auth state to true');
    this.isAuthenticatedSubject.next(true);
  }

  getToken(): string | null {
    return this.loginService.getToken();
  }

  getUserName(): string | null {
    return this.loginService.getUserName();
  }
} 