import { Component } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError, RouterOutlet } from '@angular/router';
import { TitleService } from './services/title.service';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { AppConfigurator } from './layout/components/app.configurator';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, CommonModule,],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'ISLF';
  public loading = false;
  private lockTimeout: any = null;
  private readonly LOCK_DELAY_MS = 3600000; // 1 hour

  constructor(private titleService: TitleService, private router: Router) {
    this.titleService.init('ISLF');
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading = false;
      }
    });

    // Listen for tab/window visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.addEventListener('blur', this.handleBlur.bind(this));
    window.addEventListener('focus', this.handleFocus.bind(this));
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      this.startLockTimer();
    } else {
      this.clearLockTimer();
    }
  }

  private handleBlur() {
    this.startLockTimer();
  }

  private handleFocus() {
    this.clearLockTimer();
  }

  private startLockTimer() {
    if (this.lockTimeout) return;
    this.lockTimeout = setTimeout(() => {
      this.router.navigate(['/auth/lockscreen']);
      this.lockTimeout = null;
    }, this.LOCK_DELAY_MS);
  }

  private clearLockTimer() {
    if (this.lockTimeout) {
      clearTimeout(this.lockTimeout);
      this.lockTimeout = null;
    }
  }
}
