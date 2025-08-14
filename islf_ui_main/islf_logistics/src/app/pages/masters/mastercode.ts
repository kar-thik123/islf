import { Component, OnInit ,OnDestroy} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { MasterCodeService } from '../../services/mastercode.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfigService } from '../../services/config.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ContextService } from '../../services/context.service';
interface PageFieldOption {
  label: string;
  value: string;
  fields: { label: string; value: string }[];
}

@Component({
  selector: 'master-code',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    InputSwitchModule,
    ToastModule,
    IconFieldModule,
    InputIconModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Master Code</div>
      <p-table
        #dt
        [value]="masters"
        dataKey="code"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'description', 'reference', 'status']"
        responsiveLayout="scroll"
      >
        <!-- 🔍 Global Filter + Clear -->
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Master" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <p-iconfield iconPosition="left" class="ml-auto">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
            </p-iconfield>
          </div>
        </ng-template>
        <!-- 🧾 Table Headers with Filters -->
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
                Reference
                <p-columnFilter type="text" field="reference" display="menu" placeholder="Search by reference"></p-columnFilter>
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
        <!-- 👤 Table Body -->
        <ng-template pTemplate="body" let-master let-rowIndex="rowIndex">
          <tr>
            <td>
              <ng-container *ngIf="master.isNew; else codeText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="master.code" (ngModelChange)="onFieldChange(master, 'code', master.code)" [ngClass]="getFieldErrorClass(master, 'code')" [ngStyle]="getFieldErrorStyle(master, 'code')" required/>
                  <small *ngIf="getFieldError(master, 'code')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(master, 'code') }}</small>
                </div>
              </ng-container>
              <ng-template #codeText>{{ master.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="master.isNew || master.isEditing; else descText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="master.description" (ngModelChange)="onFieldChange(master, 'description', master.description)" [ngClass]="getFieldErrorClass(master, 'description')" [ngStyle]="getFieldErrorStyle(master, 'description')" required/>
                  <small *ngIf="getFieldError(master, 'description')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(master, 'description') }}</small>
                </div>
              </ng-container>
              <ng-template #descText>{{ master.description }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="master.isNew || master.isEditing; else refText">
                <p-multiselect
                  [options]="referenceOptions"
                  [(ngModel)]="master.reference"
                  placeholder="Select Reference"
                  optionLabel="label"
                  optionValue="value"
                  filter
                  [style]="{ width: '100%' }"
                  appendTo="body"
                ></p-multiselect>
              </ng-container>
              <ng-template #refText>{{ master.reference }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="master.isEditing || master.isNew; else statusText">
                <p-dropdown
                  [options]="statuses"
                  [(ngModel)]="master.status"
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
                      'text-green-700 bg-green-100': master.status === 'Active',
                      'text-red-700 bg-red-100': master.status === 'Inactive',
                    }"
                  >
                    {{ master.status }}
                  </span>

              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(master)"
                  title="Edit"
                  *ngIf="!master.isEditing && !master.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="saveRow(master)"
                  title="Save"
                  [disabled]="!isMasterValid(master)"
                  *ngIf="master.isEditing || master.isNew"
                ></button>
                <button
                *ngIf="master.isNew"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm"
                  severity="danger"
                  (click)="deleteRow(master)"
                  title="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <!-- 📊 Total Masters Count -->
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Masters: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [],
})
// Add imports and implement OnDestroy:


export class MasterCodeComponent implements OnInit, OnDestroy {
  masters: any[] = [];
  activeCodes: any[] = [];
  private contextSubscription: Subscription | undefined;

  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  referenceOptions= [
    {label: 'User / Status', value: 'User / Status'},
    {label: 'User / Role', value: 'User / Role'},
    {label: 'User / Designation', value: 'User / Designation'},
    {label:'master/vendor', value: 'master/vendor'},
    {label:'master/customer', value: 'master/customer'},
    {label:'master/carrier', value: 'master/carrier'},
    {label:'master/container', value: 'master/container'},
    {label:'master/currency', value: 'master/currency'}, 
    {label:'master/basis', value: 'master/basis'},
    {label:'master/itemName', value: 'master/itemName'},
  ];

  // Field validation states
  fieldErrors: { [key: string]: { [fieldName: string]: string } } = {};

  constructor(
    private router: Router,
    private masterService: MasterCodeService,
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
      console.log('Context changed in MasterCodeComponent, reloading data...');
      this.refreshList();
    });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  refreshList() {
    console.log('Refreshing master codes list...');
    
    // The service now handles context filtering automatically
    this.masterService.getMasters().subscribe({
      next: (res: any) => {
        this.masters = (res || []).map((item: any) => ({
          ...item,
          isEditing: false,
          isNew: false,
          reference: item.reference ? item.reference.split(',') : []
        }));
        this.activeCodes = this.masters.filter((c: any) => c.status === 'Active');
        console.log('Master codes loaded:', this.masters.length);
      },
      error: (error) => {
        console.error('Error loading master codes:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load master codes' 
        });
        this.masters = [];
      }
    });
  }

  getActiveCodes() {
    return this.activeCodes;
  }

  // Add missing validation methods
  validateField(master: any, fieldName: string, value: any): string {
    switch (fieldName) {
      case 'code':
        if (!value || value.toString().trim() === '') {
          return 'Code is required';
        }
        if (master?.isNew && this.isCodeDuplicate(value)) {
          return 'Code already exists';
        }
        break;
      case 'description':
        if (!value || value.toString().trim() === '') {
          return 'Description is required';
        }
        break;
    }
    return '';
  }

  onFieldChange(master: any, fieldName: string, value: any) {
    const error = this.validateField(master, fieldName, value);
    const masterKey = master.isNew ? 'new' : master.code;
    
    if (!this.fieldErrors[masterKey]) {
      this.fieldErrors[masterKey] = {};
    }
    
    if (error) {
      this.fieldErrors[masterKey][fieldName] = error;
    } else {
      delete this.fieldErrors[masterKey][fieldName];
    }
  }

  isCodeDuplicate(code: string): boolean {
    const codeValue = code.trim().toLowerCase();
    return this.masters.some(m => 
      (m.code || '').trim().toLowerCase() === codeValue && !m.isNew
    );
  }

  getFieldErrorClass(master: any, fieldName: string): string {
    const masterKey = master.isNew ? 'new' : master.code;
    return this.fieldErrors[masterKey]?.[fieldName] ? 'p-invalid' : '';
  }

  getFieldErrorStyle(master: any, fieldName: string): { [key: string]: string } {
    const masterKey = master.isNew ? 'new' : master.code;
    return this.fieldErrors[masterKey]?.[fieldName] ? { 'border-color': '#f44336' } : {};
  }

  getFieldError(master: any, fieldName: string): string {
    const masterKey = master.isNew ? 'new' : master.code;
    return this.fieldErrors[masterKey]?.[fieldName] || '';
  }

  isMasterValid(master: any): boolean {
    const masterKey = master.isNew ? 'new' : master.code;
    const errors = this.fieldErrors[masterKey] || {};
    
    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      return false;
    }
    
    // Check required fields
    return master.code && master.code.trim() !== '' &&
           master.description && master.description.trim() !== '';
  }

  addRow() {
    console.log('Add Master Code button clicked - starting addRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const masterCodeFilter = config?.validation?.masterCodeFilter || '';
    
    console.log('Master code filter:', masterCodeFilter);
    
    // Check if we need to validate context
    if (masterCodeFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      const missingContexts: string[] = [];
      
      if (masterCodeFilter.includes('C') && !context.companyCode) {
        missingContexts.push('Company');
      }
      if (masterCodeFilter.includes('B') && !context.branchCode) {
        missingContexts.push('Branch');
      }
      if (masterCodeFilter.includes('D') && !context.departmentCode) {
        missingContexts.push('Department');
      }
      
      const contextValid = missingContexts.length === 0;
      
      console.log('Context valid:', contextValid, 'Missing contexts:', missingContexts);
      
      if (!contextValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Context Required',
          detail: `Please select ${missingContexts.join(', ')} in the context selector before adding a Master Code.`
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
      reference: '',
      status: 'Active',
      isEditing: true,
      isNew: true
    };
    this.masters = [newRow, ...this.masters];
    // Clear field errors for new row
    this.fieldErrors['new'] = {};
  }

  saveRow(master: any) {
    if (!this.isMasterValid(master)) return;
    
    if (master.isNew) {
      const referenceValue = Array.isArray(master.reference)
        ? master.reference.join(',')
        : master.reference;
      this.masterService.createMaster({
        code: master.code,
        description: master.description,
        reference: referenceValue,
        status: master.status
      }).subscribe({
        next: (res) => {
          Object.assign(master, res, { isEditing: false, isNew: false });
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Master saved successfully' });
          this.refreshList();
        },
        error: (err) => {
          console.error('Failed to save master', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
      });
    } else {
      const referenceValue = Array.isArray(master.reference)
        ? master.reference.join(',')
        : master.reference;
      this.masterService.updateMaster(master.code, {
        description: master.description,
        reference: referenceValue,
        status: master.status
      }).subscribe({
        next: () => {
          master.isEditing = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Master updated successfully' });
          this.refreshList();
        },
        error: (err) => {
          console.error('Failed to update master', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
        }
      });
    }
  }

  editRow(master: any) {
    this.masters.forEach(m => m.isEditing = false);
    master.isEditing = true;
    master.isNew = false;
    // Clear field errors for editing row
    if (this.fieldErrors[master.code]) {
      delete this.fieldErrors[master.code];
    }
  }

  deleteRow(master: any) {
    if (master.code && !master.isNew) {
      this.masterService.deleteMaster(master.code).subscribe({
        next: () => {
          this.masters = this.masters.filter(m => m !== master);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Master deleted' });
          this.refreshList();
        },
        error: (err) => {
          console.error('Failed to delete master', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
        }
      });
    } else {
      this.masters = this.masters.filter(m => m !== master);
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
