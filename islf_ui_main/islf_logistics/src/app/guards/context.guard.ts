import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ContextService } from '../services/context.service';

@Injectable({
  providedIn: 'root'
})
export class ContextGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private contextService: ContextService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      // User is authenticated, now check if context is set
      if (this.contextService.isContextSet()) {
        // Context is set, allow access
        return true;
      } else {
        // Context is not set, redirect to context selection
        // For now, we'll allow access but the app should prompt for context
        // In a more sophisticated implementation, we might redirect to a context selection page
        return true;
      }
    } else {
      // User is not authenticated, redirect to login
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}