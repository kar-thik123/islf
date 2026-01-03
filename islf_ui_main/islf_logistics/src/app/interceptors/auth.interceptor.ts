import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  // Skip token injection for public routes
  const isPublicRoute = req.url.includes('/api/public/');

  if (token && !isPublicRoute) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: any) => {
      if (error && (error.status === 401 || error.status === 403)) {
        const hasToken = !!authService.getToken();
        authService.logout(true); // Clear credentials but keep username for lockscreen

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