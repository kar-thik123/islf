import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BasisService } from '../../services/basis.service';
import { ConfigService } from '../../services/config.service';
import { ContextService } from '../../services/context.service';
import { Subscription } from 'rxjs';
import {debounceTime,distinctUntilChanged} from 'rxjs/operators';

@Component({
  selector: 'basis-code',
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
      <div class="font-semibold text-xl mb-4">Basis</div>
      <p-table
        #dt
        [value]="basis"
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
            <button pButton type="button" label="Add Basis" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" class="ml-auto" />
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Code
                <p-columnFilter type="text" field="code" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Description
                <p-columnFilter type="text" field="description" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Status
                <p-columnFilter field="status" matchMode="equals" display="menu" [showMatchModes]="false" [showOperator]="false" [showAddButton]="false">
                  <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                    <p-dropdown [ngModel]="value" [options]="statuses" (onChange)="filter($event.value)" placeholder="Any" [showClear]="true">
                      <ng-template let-option pTemplate="item">
                        <span>{{option.label}}</span>
                      </ng-template>
                    </p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th>Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-basisItem let-rowIndex="rowIndex">
          <tr>
            <td>
              <ng-container *ngIf="basisItem.isNew; else codeText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="basisItem.code" (ngModelChange)="onFieldChange(basisItem, 'code', basisItem.code)" [ngClass]="getFieldErrorClass(basisItem, 'code')" [ngStyle]="getFieldErrorStyle(basisItem, 'code')" />
                  <small *ngIf="getFieldError(basisItem, 'code')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(basisItem, 'code') }}</small>
                </div>
              </ng-container>
              <ng-template #codeText>{{ basisItem.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="basisItem.isNew || basisItem.isEditing; else descText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="basisItem.description" (ngModelChange)="onFieldChange(basisItem, 'description', basisItem.description)" [ngClass]="getFieldErrorClass(basisItem, 'description')" [ngStyle]="getFieldErrorStyle(basisItem, 'description')" />
                  <small *ngIf="getFieldError(basisItem, 'description')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(basisItem, 'description') }}</small>
                </div>
              </ng-container>
              <ng-template #descText>{{ basisItem.description }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="basisItem.isEditing || basisItem.isNew; else statusText">
                <p-dropdown
                  [options]="statuses"
                  [(ngModel)]="basisItem.status"
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
                    'text-green-700 bg-green-100': basisItem.status === 'Active',
                    'text-red-700 bg-red-100': basisItem.status === 'Inactive',
                  }"
                >
                  {{ basisItem.status }}
                </span>
              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(basisItem)"
                  title="Edit"
                  *ngIf="!basisItem.isEditing && !basisItem.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="saveRow(basisItem)"
                  title="Save"
                  [disabled]="!isBasisValid(basisItem)"
                  *ngIf="basisItem.isEditing || basisItem.isNew"
                ></button>
                <button
                  *ngIf="basisItem.isNew"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm"
                  severity="danger"
                  (click)="deleteRow(basisItem)"
                  title="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Basis: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [],
})
export class BasisComponent implements OnInit, OnDestroy {
  basis: any[] = [];
  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  // Field validation states
  fieldErrors: { [key: string]: { [fieldName: string]: string } } = {};
  private contextSubscription: Subscription | undefined;

  constructor(
    private basisService: BasisService,
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
      console.log('Context changed in BasisComponent, reloading data...');
      this.refreshList();
    });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  refreshList() {
    // Get the Validation settings
    const config = this.configService.getConfig();
    const basisFilter = config?.validation?.basisFilter || '';
    
    // Determine if we should filter by context based on validation settings
    const filterByContext = basisFilter.includes('C') || 
                           basisFilter.includes('B') || 
                           basisFilter.includes('D');
    
    console.log('Basis filter:', basisFilter);
    console.log('Filter by context:', filterByContext);
    
    // The BasisService with updated getAll() method handles context filtering
    this.basisService.getBasis().subscribe({
      next: (data) => {
        this.basis = data || [];
        console.log('Basis loaded:', this.basis.length);
      },
      error: (error) => {
        console.error('Error loading basis:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load basis codes' 
        });
        this.basis = [];
      }
    });
  }

  // Update the addRow method to match containercode pattern
  addRow() {
    console.log('Add Basis button clicked - starting addRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const basisFilter = config?.validation?.basisFilter || '';
    
    console.log('Basis filter:', basisFilter);
    
    // Check if we need to validate context
    if (basisFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      const missingContexts: string[] = [];
      
      if (basisFilter.includes('C') && !context.companyCode) {
        missingContexts.push('Company');
      }
      if (basisFilter.includes('B') && !context.branchCode) {
        missingContexts.push('Branch');
      }
      if (basisFilter.includes('D') && !context.departmentCode) {
        missingContexts.push('Department');
      }
      
      const contextValid = missingContexts.length === 0;
      
      console.log('Context valid:', contextValid, 'Missing contexts:', missingContexts);
      
      if (!contextValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Context Required',
          detail: `Please select ${missingContexts.join(', ')} in the context selector before adding a Basis.`
        });
        
        // Trigger the context selector
        this.contextService.showContextSelector();
        return;
      }
    }
    
    // If validation passes or no validation required, proceed with adding row
    const newBasis = {
      id: null,
      code: '',
      description: '',
      status: 'Active',
      isEditing: true,
      isNew: true
    };
    this.basis = [newBasis, ...this.basis];
  }

  editRow(basisItem: any) {
    basisItem.isEditing = true;
    basisItem.originalData = { ...basisItem };
  }

  cancelEdit(basisItem: any) {
    if (basisItem.originalData) {
      Object.assign(basisItem, basisItem.originalData);
      delete basisItem.originalData;
    }
    basisItem.isEditing = false;
  }

  deleteRow(basisItem: any) {
    if (basisItem.isNew) {
      this.basis = this.basis.filter(c => c !== basisItem);
    }
  }

  onFieldChange(basisItem: any, fieldName: string, value: any) {
    this.validateField(basisItem, fieldName, value);
  }

  validateField(basisItem: any, fieldName: string, value: any) {
    const key = basisItem.code || 'new';
    if (!this.fieldErrors[key]) {
      this.fieldErrors[key] = {};
    }

    // Clear previous error
    delete this.fieldErrors[key][fieldName];

    // Validate based on field
    switch (fieldName) {
      case 'code':
        if (!value || value.toString().trim() === '') {
          this.fieldErrors[key][fieldName] = 'Code is required';
        } else if (this.isCodeDuplicate(basisItem, value)) {
          this.fieldErrors[key][fieldName] = 'Code already exists';
        }
        break;
      case 'description':
        if (!value || value.toString().trim() === '') {
          this.fieldErrors[key][fieldName] = 'Description is required';
        }
        break;
    }
  }

  isCodeDuplicate(basisItem: any, code: string): boolean {
    if (!basisItem.isNew) return false;
    const codeValue = code.trim().toLowerCase();
    return this.basis.some(c => 
      c !== basisItem && 
      (c.code || '').trim().toLowerCase() === codeValue
    );
  }

  getFieldErrorClass(basisItem: any, fieldName: string): string {
    const errors = this.fieldErrors[basisItem.code || 'new'];
    return errors && errors[fieldName] ? 'p-invalid' : '';
  }

  getFieldErrorStyle(basisItem: any, fieldName: string): any {
    const errors = this.fieldErrors[basisItem.code || 'new'];
    return errors && errors[fieldName] ? { 'border-color': '#e24c4c' } : {};
  }

  getFieldError(basisItem: any, fieldName: string): string {
    const errors = this.fieldErrors[basisItem.code || 'new'];
    return errors ? errors[fieldName] : '';
  }

  isBasisValid(basisItem: any): boolean {
    // For existing basis, check if basic required fields are present
    if (!basisItem.isNew && basisItem.code && basisItem.description) {
      const errors = this.fieldErrors[basisItem.code || 'new'];
      if (!errors) {
        // No validation errors recorded, check basic field requirements
        return basisItem.code.toString().trim() !== '' && 
               basisItem.description.toString().trim() !== '';
      }
      // If errors exist, check them
      const hasCodeError = errors['code'];
      const hasDescriptionError = errors['description'];
      return !hasCodeError && !hasDescriptionError;
    }

    const errors = this.fieldErrors[basisItem.code || 'new'];
    if (!errors) return false;
    
    const hasCodeError = errors['code'];
    const hasDescriptionError = errors['description'];
    
    return !hasCodeError && !hasDescriptionError && 
           basisItem.code && basisItem.code.toString().trim() !== '' &&
           basisItem.description && basisItem.description.toString().trim() !== '';
  }

  clearFieldErrors(basisItem: any) {
    const key = basisItem.code || 'new';
    this.fieldErrors[key] = {};
    
    // Validate all fields to populate initial errors
    this.validateField(basisItem, 'code', basisItem.code);
    this.validateField(basisItem, 'description', basisItem.description);
  }

  saveRow(basisItem: any) {
    // Validate all fields before saving
    this.validateField(basisItem, 'code', basisItem.code);
    this.validateField(basisItem, 'description', basisItem.description);
    
    if (!this.isBasisValid(basisItem)) {
      return;
    }

    if (basisItem.isNew) {
      // Create new basis
      const basisData = {
        code: basisItem.code,
        description: basisItem.description,
        status: basisItem.status || 'Active'
      };

      this.basisService.createBasis(basisData).subscribe({
        next: (response) => {
          // Update the basis item with the response data
          Object.assign(basisItem, response);
          basisItem.isNew = false;
          basisItem.isEditing = false;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Basis created successfully'
          });
        },
        error: (error) => {
          console.error('Error creating basis:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create basis'
          });
        }
      });
    } else {
      // Update existing basis
      const basisData = {
        description: basisItem.description,
        status: basisItem.status
      };

      this.basisService.updateBasis(basisItem.code, basisData).subscribe({
        next: (response) => {
          Object.assign(basisItem, response);
          basisItem.isEditing = false;
          delete basisItem.originalData;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Basis updated successfully'
          });
        },
        error: (error) => {
          console.error('Error updating basis:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update basis'
          });
        }
      });
    }
  }

  clear(table: any) {
    table.clear();
  }

  onGlobalFilter(table: any, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}