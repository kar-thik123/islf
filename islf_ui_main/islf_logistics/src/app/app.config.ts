import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {provideAnimations} from '@angular/platform-browser/animations';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { MessageService } from 'primeng/api';
import { AppBreadcrumb } from './layout/components/app.breadcrumb';
import { AppLayout } from './layout/components/app.layout';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import {spinnerInterceptor} from '@/interceptors/spinner.interceptor';
import {NgxSpinnerModule} from 'ngx-spinner';


export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        // provideAnimationsAsync(),
        provideAnimations(),
        provideHttpClient(withFetch(), withInterceptors([AuthInterceptor, spinnerInterceptor])),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        MessageService,
        importProvidersFrom(NgxSpinnerModule),

      
    ]
};
