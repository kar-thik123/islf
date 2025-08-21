import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { ContextService, UserContext } from './services/context.service';
import { AuthService } from './services/auth.service';
import { CompanyService } from './services/company.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastModule,
    CommonModule
    // Removed ContextSelectorComponent to avoid conflicts with AppTopbar
  ],
  template: `
   
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor(
    private contextService: ContextService,
    private authService: AuthService,
    private router: Router,
    private companyService: CompanyService
  ) {}

  ngOnInit() {
    this.router.events.subscribe(() => this.updateContextSelectorVisibility());
    this.updateContextSelectorVisibility();
    
    // Subscribe to context service to show context selector when needed
    this.contextService.showContextSelector$.subscribe(show => {
      // We're not using AppComponent's context selector anymore, 
      // AppTopbar handles this now
    });
    
    // Debug logging for context selector visibility
    console.log('AppComponent initialized');
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
    
    // After login, if context is not set, check if there are companies first
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