import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-it-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  template: `
    <div class="card max-w-lg mx-auto mt-8 p-6">
      <h2 class="text-2xl font-bold mb-4">IT Setup</h2>
      <form (ngSubmit)="save()">
        <div class="mb-4">
          <label class="block mb-1 font-medium">Max Companies</label>
          <input type="number" min="1" class="p-inputtext w-full" [(ngModel)]="maxCompaniesValue" name="maxCompanies" required />
        </div>
        <button pButton type="submit" label="Save" class="p-button-primary" [disabled]="loading()"></button>
      </form>
      <div class="mt-8">
        <label class="block mb-1 font-medium">Default Logo</label>
        <input type="file" accept="image/*" (change)="onLogoSelected($event)" />
        <div *ngIf="defaultLogo()" class="mt-2">
          <img [src]="defaultLogo()" alt="Default Logo Preview" class="h-16 max-w-xs border rounded shadow" />
        </div>
        <button pButton type="button" label="Save Logo" class="p-button-primary mt-2" (click)="saveLogo()" [disabled]="loading()"></button>
      </div>
      <div *ngIf="message()" class="mt-4 text-green-600">{{ message() }}</div>
      <div *ngIf="error()" class="mt-4 text-red-600">{{ error() }}</div>
    </div>
  `
})
export class ITSetupComponent implements OnInit {
  maxCompaniesValue = 1;
  message = signal('');
  error = signal('');
  loading = signal(false);
  defaultLogo = signal<string | null>(null);
  logoChanged = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetch();
    this.fetchLogo();
  }

  fetch() {
    this.loading.set(true);
    this.http.get<{ value: number }>('/api/settings/max_companies').subscribe({
      next: (res) => {
        this.maxCompaniesValue = res.value || 1;
        this.loading.set(false);
        this.error.set('');
      },
      error: () => {
        this.error.set('Failed to load configuration');
        this.loading.set(false);
      }
    });
  }

  fetchLogo() {
    this.http.get<{ value: string | null }>('/api/settings/default_logo').subscribe({
      next: (res) => {
        this.defaultLogo.set(res.value || null);
      },
      error: () => {
        this.defaultLogo.set(null);
      }
    });
  }

  onLogoSelected(event: any) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.defaultLogo.set(e.target.result);
      this.logoChanged = true;
    };
    reader.readAsDataURL(file);
  }

  saveLogo() {
    if (!this.defaultLogo()) {
      this.error.set('Please select a logo image.');
      return;
    }
    this.loading.set(true);
    this.http.post('/api/settings/default_logo', { value: this.defaultLogo() }).subscribe({
      next: () => {
        this.message.set('Default logo saved!');
        this.error.set('');
        this.loading.set(false);
        this.logoChanged = false;
      },
      error: () => {
        this.error.set('Failed to save default logo');
        this.loading.set(false);
      }
    });
  }

  save() {
    this.loading.set(true);
    this.http.post('/api/settings/max_companies', { value: this.maxCompaniesValue }).subscribe({
      next: () => {
        this.message.set('Configuration saved!');
        this.error.set('');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to save configuration');
        this.loading.set(false);
      }
    });
  }
} 