import { Component ,HostListener, OnDestroy, OnInit} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { ContextService, UserContext } from './services/context.service';
import { AuthService } from './services/auth.service';
import { CompanyService } from './services/company.service';
import { ConfigService } from './services/config.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastModule,
    CommonModule
  ],
  template: `
   
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private idleTimerSub?: Subscription;
  private idleTimeout = 5 * 60 * 1000; // Default 5 minutes, will be updated from config
  constructor(
    private contextService: ContextService,
    private authService: AuthService,
    private router: Router,
    private companyService: CompanyService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.router.events.subscribe(() => this.updateContextSelectorVisibility());
    this.updateContextSelectorVisibility();

     // Subscribe to context service to show context selector when needed
    this.contextService.showContextSelector$.subscribe(show => {
    this.resetIdleTimer();
    });
    
    // Load session timeout from config
    this.loadSessionTimeout();
    
    // Debug logging for context selector visibility
    console.log('AppComponent initialized');
  }
    ngOnDestroy() {
    this.clearIdleTimer();
  }

  // 🔹 User activity listeners
  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  @HostListener('window:click')
  handleUserActivity() {
    this.resetIdleTimer();
  }

  private loadSessionTimeout() {
    // Get session timeout from config service
    this.configService.config$.subscribe(config => {
      if (config?.system?.sessionTimeout) {
        // Convert minutes to milliseconds
        this.idleTimeout = config.system.sessionTimeout * 60 * 1000;
        console.log(`Session timeout updated to ${config.system.sessionTimeout} minutes (${this.idleTimeout}ms)`);
        // Reset the timer with new timeout if user is authenticated
        if (this.authService.isAuthenticated()) {
          this.resetIdleTimer();
        }
      }
    });

    // Also get the current config immediately in case it's already loaded
    const currentConfig = this.configService.getSystemConfig();
    if (currentConfig?.sessionTimeout) {
      this.idleTimeout = currentConfig.sessionTimeout * 60 * 1000;
      console.log(`Session timeout initialized to ${currentConfig.sessionTimeout} minutes (${this.idleTimeout}ms)`);
    }
  }

  private resetIdleTimer() {
    this.clearIdleTimer();
    this.idleTimerSub = timer(this.idleTimeout).subscribe(() => {
      this.handleIdleTimeout();
    });
  }

  private clearIdleTimer() {
    if (this.idleTimerSub) {
      this.idleTimerSub.unsubscribe();
      this.idleTimerSub = undefined;
    }
  }

  private handleIdleTimeout() {
    console.warn('User inactive — locking screen');
    this.authService.logout(true); // clear token/session but preserve username for lockscreen
    this.router.navigate(['auth/lockscreen']); // redirect to lockscreen
  }

  updateContextSelectorVisibility() {
    const isLoggedIn = this.authService.isAuthenticated();
    const isPublicRoute = ['/login', '/forgotpassword', '/newpassword', '/lockscreen'].some(r => this.router.url.includes(r));
    const isContextSet = this.contextService.isContextSet();
    
    // Debug logging
    console.log('Context selector check:', {
      isLoggedIn,
      isPublicRoute,
      isContextSet,
      url: this.router.url
    });
    
    if (isLoggedIn && !isPublicRoute && !isContextSet) {
      // Check if there are any companies before showing context selector
      this.companyService.getAll().subscribe({
        next: (companies) => {
          console.log('Company count check:', companies?.length || 0);
          // Only show context selector if there are companies (company count >= 1)
          if (companies && companies.length >= 1) {
            this.contextService.showContextSelector();
          } else {
            console.log('No companies found, context dialog will not be shown');
          }
        },
        error: (error) => {
          console.error('Error checking companies:', error);
          // On error, don't show context selector
        }
      });
    }
  }
}