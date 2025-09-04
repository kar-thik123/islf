import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CurrencyCodeService } from '../../services/currencycode.service';
import { ConfigService } from '../../services/config.service';
import { ContextService } from '../../services/context.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'currency-code',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    ToastModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Currency Code</div>
      <p-table
        #dt
        [value]="currencies"
        dataKey="code"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'description', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Currency" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" class="ml-auto" />
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Code
                <p-columnFilter type="text" field="code" display="menu" placeholder="Search by code"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Description
                <p-columnFilter type="text" field="description" display="menu" placeholder="Search by description"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Status
                <p-columnFilter field="status" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="statuses"
                      (onChange)="filter($event.value)"
                      placeholder="Any"
                      styleClass="w-full"
                      optionLabel="label"
                    >
                      <ng-template let-option pTemplate="item">
                        <span class="font-semibold text-sm">{{ option.label }}</span>
                      </ng-template>
                    </p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-currency let-rowIndex="rowIndex">
          <tr>
            <td>
              <ng-container *ngIf="currency.isNew; else codeText">
              
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="currency.code" (ngModelChange)="onFieldChange(currency, 'code', currency.code)" [ngClass]="getFieldErrorClass(currency, 'code')" [ngStyle]="getFieldErrorStyle(currency, 'code')" />
                  <small *ngIf="getFieldError(currency, 'code')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(currency, 'code') }}</small>
                </div>
              </ng-container>
              <ng-template #codeText>{{ currency.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="currency.isNew || currency.isEditing; else descText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="currency.description" (ngModelChange)="onFieldChange(currency, 'description', currency.description)" [ngClass]="getFieldErrorClass(currency, 'description')" [ngStyle]="getFieldErrorStyle(currency, 'description')" />
                  <small *ngIf="getFieldError(currency, 'description')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(currency, 'description') }}</small>
                </div>
              </ng-container>
              <ng-template #descText>{{ currency.description }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="currency.isEditing || currency.isNew; else statusText">
                <p-dropdown
                  [options]="statuses"
                  [(ngModel)]="currency.status"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Status"
                  appendTo="body"
                ></p-dropdown>
              </ng-container>
              <ng-template #statusText>
                <span
                  class="text-sm font-semibold px-3 py-1 rounded-full"
                  [ngClass]="{
                    'text-green-700 bg-green-100': currency.status === 'Active',
                    'text-red-700 bg-red-100': currency.status === 'Inactive',
                  }"
                >
                  {{ currency.status }}
                </span>
              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(currency)"
                  title="Edit"
                  *ngIf="!currency.isEditing && !currency.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="saveRow(currency)"
                  title="Save"
                  [disabled]="!isCurrencyValid(currency)"
                  *ngIf="currency.isEditing || currency.isNew"
                ></button>
                <button
                  *ngIf="currency.isNew"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm"
                  severity="danger"
                  (click)="deleteRow(currency)"
                  title="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Currencies: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [],
})
export class CurrencyCodeComponent implements OnInit, OnDestroy {
  currencies: any[] = [];
  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  // Field validation states
  fieldErrors: { [key: string]: { [fieldName: string]: string } } = {};
  private contextSubscription: Subscription | undefined;

  constructor(
    private currencyService: CurrencyCodeService,
    private messageService: MessageService,
    private configService: ConfigService,
    private contextService: ContextService
  ) {}

  ngOnInit() {
    this.refreshList();
    
    // Subscribe to context changes and reload data when context changes
    this.contextSubscription = this.contextService.context$.pipe(
      debounceTime(300), // Wait 300ms after the last context change
      distinctUntilChanged() // Only emit when context actually changes
    ).subscribe(() => {
      console.log('Context changed in CurrencyCodeComponent, reloading data...');
      this.refreshList();
    });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  refreshList() {
    console.log('Refreshing currency codes list');
    
    try {
      // ❌ Remove context validation block
      
      this.currencyService.getCurrencies().subscribe({
        next: (res: any) => {
          this.currencies = (res || []).map((item: any) => ({
            ...item,
            isEditing: false,
            isNew: false
          }));
          console.log('Currencies loaded successfully:', this.currencies.length);
        },
        error: (error) => {
          console.error('Error loading currencies:', error);
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to load currency codes' 
          });
          this.currencies = [];
        }
      });
    } catch (error) {
      console.error('Error in refreshList:', error);
    }
  }

  addRow() {
    console.log('=== CURRENCY ADD ROW CLICKED ===');
    console.log('Add Currency button clicked - starting addRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const currencyFilter = config?.validation?.currencyFilter || '';
    
    console.log('Currency filter:', currencyFilter);
    
    // Check if we need to validate context
    if (currencyFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      const missingContexts: string[] = [];
      
      if (currencyFilter.includes('C') && !context.companyCode) {
        missingContexts.push('Company');
      }
      if (currencyFilter.includes('B') && !context.branchCode) {
        missingContexts.push('Branch');
      }
      if (currencyFilter.includes('D') && !context.departmentCode) {
        missingContexts.push('Department');
      }
      
      if (missingContexts.length > 0) {
        console.log('Missing contexts:', missingContexts);
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: `Please select ${missingContexts.join(', ')} before adding currency`
        });
        
        // Trigger the context selector
        this.contextService.showContextSelector();
        return;
      }
    }
    
    // If validation passes or no validation required, proceed with adding row
    const newRow = {
      id: null,
      code: '',
      description: '',
      status: 'Active',
      isEditing: true,
      isNew: true
    };
    this.currencies = [newRow, ...this.currencies];
    // Clear field errors for new row
    this.fieldErrors['new'] = {};
    
    console.log('New currency row added successfully');
  }

  // Validation methods
  validateField(currency: any, fieldName: string, value: any): string {
    switch (fieldName) {
      case 'code':
        if (!value || value.toString().trim() === '') {
          return ' *Code is required';
        }
        if (currency.isNew && this.isCodeDuplicate(currency, value)) {
          return ' *Code already exists';
        }
        break;
      case 'description':
        if (!value || value.toString().trim() === '') {
          return ' *Description is required';
        }
        break;
    }
    return '';
  }

  onFieldChange(currency: any, fieldName: string, value: any) {
    const error = this.validateField(currency, fieldName, value);
    if (!this.fieldErrors[currency.code || 'new']) {
      this.fieldErrors[currency.code || 'new'] = {};
    }
    if (error) {
      this.fieldErrors[currency.code || 'new'][fieldName] = error;
    } else {
      delete this.fieldErrors[currency.code || 'new'][fieldName];
    }
  }

  isCodeDuplicate(currency: any, code: string): boolean {
    if (!currency.isNew) return false;
    const codeValue = code.trim().toLowerCase();
    return this.currencies.some(c => 
      c !== currency && 
      (c.code || '').trim().toLowerCase() === codeValue
    );
  }

  getFieldErrorClass(currency: any, fieldName: string): string {
    const errors = this.fieldErrors[currency.code || 'new'];
    return errors && errors[fieldName] ? 'p-invalid' : '';
  }

  getFieldErrorStyle(currency: any, fieldName: string): { [key: string]: string } {
    const errors = this.fieldErrors[currency.code || 'new'];
    return errors && errors[fieldName] ? { 'border-color': '#f44336' } : {};
  }

  getFieldError(currency: any, fieldName: string): string {
    const errors = this.fieldErrors[currency.code || 'new'];
    return errors ? errors[fieldName] || '' : '';
  }

  isCurrencyValid(currency: any): boolean {
       // For existing currency, check if basic required fields are present
    if (!currency.isNew && currency.code && currency.description) {
      const errors = this.fieldErrors[currency.code || 'new'];
      if (!errors) {
        // No validation errors recorded, check basic field requirements
        return currency.code.toString().trim() !== '' && 
               currency.description.toString().trim() !== '';
      }
      // If errors exist, check them
      const hasCodeError = errors['code'];
      const hasDescriptionError = errors['description'];
      return !hasCodeError && !hasDescriptionError;
    }
    
    const errors = this.fieldErrors[currency.code || 'new'];
    if (!errors) return false;
    
    const hasCodeError = errors['code'];
    const hasDescriptionError = errors['description'];
    
    return !hasCodeError && !hasDescriptionError && 
           currency.code && currency.code.toString().trim() !== '' &&
           currency.description && currency.description.toString().trim() !== '';
  }

  saveRow(currency: any) {
    if (!this.isCurrencyValid(currency)) return;
    
    if (currency.isNew) {
      this.currencyService.createCurrency({
        code: currency.code,
        description: currency.description,
        status: currency.status
      }).subscribe({
        next: (res) => {
          Object.assign(currency, res, { isEditing: false, isNew: false });
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Currency saved successfully' });
          this.refreshList();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
      });
    } else {
      this.currencyService.updateCurrency(currency.code, {
        description: currency.description,
        status: currency.status
      }).subscribe({
        next: () => {
          currency.isEditing = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Currency updated successfully' });
          this.refreshList();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
        }
      });
    }
  }

  editRow(currency: any) {
    this.currencies.forEach(c => c.isEditing = false);
    currency.isEditing = true;
    currency.isNew = false;
    // Clear field errors for editing row
    if (this.fieldErrors[currency.code]) {
      delete this.fieldErrors[currency.code];
    }
  }

  deleteRow(currency: any) {
    if (currency.code && !currency.isNew) {
      this.currencyService.deleteCurrency(currency.code).subscribe({
        next: () => {
          this.currencies = this.currencies.filter(c => c !== currency);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Currency deleted' });
          this.refreshList();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
        }
      });
    } else {
      this.currencies = this.currencies.filter(c => c !== currency);
      this.refreshList();
    }
  }

  clear(table: any) {
    table.clear();
  }

  onGlobalFilter(table: any, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }
}