// spinner.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';

export const spinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  const skipLoading = req.headers.get('X-Skip-Loading') === 'true';

  if (skipLoading) {
    return next(req);
  }

  // Start tracking this request
  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      // Decrease counter when request finishes (Success or Error)
      loadingService.hide();
    })
  );
};
