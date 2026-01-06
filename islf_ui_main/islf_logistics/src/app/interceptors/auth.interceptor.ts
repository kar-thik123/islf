import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip if logging out to prevent race condition requests
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/verify-password', '/api/password/forgot', '/api/password/reset', '/api/public/bootstrap-config'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  if (authService.isLoggingOut && !isPublicRoute) {
    console.log(`AuthInterceptor: Silencing request during logout: ${req.url}`);
    return EMPTY;
  }

  const token = authService.getToken();

  if (token && !isPublicRoute) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else if (!token && !isPublicRoute) {
    // If we're trying to access a protected route without a token, block it
    console.warn(`AuthInterceptor: Blocking protected request without token: ${req.url}`);
    return throwError(() => ({ status: 401, message: 'Authentication required', url: req.url }));
  }

  return next(req).pipe(
    catchError((error: any) => {
      if (error && (error.status === 401 || error.status === 403)) {
        console.warn(`AuthInterceptor: ${error.status} error for ${req.url}`);
        const hasToken = !!authService.getToken();
        authService.logout(true); // Clear credentials but keep username for lockscreen

        // If we had a token but it's now invalid, go to lockscreen
        if (hasToken) {
          router.navigate(['/auth/lockscreen']);
        } else {
          router.navigate(['/auth/login']);
        }
      }
      return throwError(() => error);
    })
  );
};