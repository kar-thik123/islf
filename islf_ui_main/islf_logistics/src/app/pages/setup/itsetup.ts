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
        <label class="block mb-1 font-medium">Document Upload Paths</label>
        <div class="space-y-4">
          <div>
            <label class="block mb-1 text-sm font-medium">Customer Documents</label>
            <input type="text" class="p-inputtext w-full" [(ngModel)]="documentUploadPaths['customer']" placeholder="e.g., /uploads/documents/customer" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">Vendor Documents</label>
            <input type="text" class="p-inputtext w-full" [(ngModel)]="documentUploadPaths['vendor']" placeholder="e.g., /uploads/documents/vendor" />
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium">Company Documents</label>
            <input type="text" class="p-inputtext w-full" [(ngModel)]="documentUploadPaths['company']" placeholder="e.g., /uploads/documents/company" />
          </div>
        </div>
        <button pButton type="button" label="Save All Paths" class="p-button-primary mt-2" (click)="saveDocumentPaths()" [disabled]="loading()"></button>
      </div>
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
  documentUploadPaths: { [key: string]: string } = {
    customer: '/uploads/documents/customer',
    vendor: '/uploads/documents/vendor',
    company: '/uploads/documents/company'
  };
  message = signal('');
  error = signal('');
  loading = signal(false);
  defaultLogo = signal<string | null>(null);
  logoChanged = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetch();
    this.fetchLogo();
    this.fetchDocumentPaths();
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

  fetchDocumentPaths() {
    // Fetch all document upload paths
    const entityTypes = ['customer', 'vendor', 'company'];
    entityTypes.forEach(entityType => {
      this.http.get<{ value: string }>(`/api/settings/document_upload_path_${entityType}`).subscribe({
        next: (res) => {
          this.documentUploadPaths[entityType] = res.value || `/uploads/documents/${entityType}`;
        },
        error: () => {
          this.documentUploadPaths[entityType] = `/uploads/documents/${entityType}`;
        }
      });
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

  saveDocumentPaths() {
    this.loading.set(true);
    const promises = Object.entries(this.documentUploadPaths).map(([entityType, path]) => {
      return this.http.post(`/api/settings/document_upload_path_${entityType}`, { value: path }).toPromise();
    });

    Promise.all(promises)
      .then(() => {
        this.message.set('All document upload paths saved!');
        this.error.set('');
        this.loading.set(false);
      })
      .catch(() => {
        this.error.set('Failed to save document upload paths');
        this.loading.set(false);
      });
  }
} 