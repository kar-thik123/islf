import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { ContextService, UserContext } from './services/context.service';
import { ContextSelectorComponent } from './pages/context-selector.component';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastModule,
    CommonModule,
    ContextSelectorComponent,
    DialogModule,
    DropdownModule,
    FormsModule
  ],
  template: `
    <app-context-selector
      *ngIf="showContextSelector"
      (contextSet)="onContextSet($event)">
    </app-context-selector>
    <router-outlet *ngIf="!showContextSelector"></router-outlet>
  `
})
export class AppComponent {
  showContextSelector = false;

  constructor(
    private contextService: ContextService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.router.events.subscribe(() => this.updateContextSelectorVisibility());
    this.updateContextSelectorVisibility();
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
    
    // Show context selector only when user is logged in and context is not set
    // and we're not on a public route
    this.showContextSelector = isLoggedIn && !isPublicRoute && !isContextSet;
    if (this.showContextSelector) {
      this.contextService.loadOptions();
    }
  }

  onContextSet(ctx: UserContext) {
    this.showContextSelector = false;
  }
}
