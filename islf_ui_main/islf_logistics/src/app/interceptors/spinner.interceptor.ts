// spinner.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Check for explicit skip flags
  const skipLoading = req.headers.get('X-Skip-Loading') === 'true' || req.params.get('silent') === 'true';

  if (skipLoading) {
    if (req.params.has('silent')) {
      // Clean up params before sending to server
      req = req.clone({ params: req.params.delete('silent') });
    }
    return next(req);
  }

  // GET requests run silently in the background by default to avoid blocking the UI
  // But we allow explicit override via X-Show-Loading header
  const forceLoading = req.headers.get('X-Show-Loading') === 'true';
  const isCriticalOperation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);

  if (!isCriticalOperation && !forceLoading) {
    // Silent execution for non-critical GET requests - no spinner
    return next(req);
  }

  // Show spinner for critical operations or forced GET requests
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Decrease counter when request finishes (Success or Error)
      loadingService.hide();
    })
  );
};
