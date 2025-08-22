import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ContainerCodeService } from '../../services/containercode.service';
import { ConfigService } from '../../services/config.service';
import { ContextService } from '../../services/context.service';
import { Subscription } from 'rxjs';
import {debounceTime,distinctUntilChanged} from 'rxjs/operators';
@Component({
  selector: 'container-code',
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
      <div class="font-semibold text-xl mb-4">Container Code</div>
      <p-table
        #dt
        [value]="containers"
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
            <button pButton type="button" label="Add Container" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
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
        <ng-template pTemplate="body" let-container let-rowIndex="rowIndex">
          <tr>
            <td>
              <ng-container *ngIf="container.isNew; else codeText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="container.code" (ngModelChange)="onFieldChange(container, 'code', container.code)" [ngClass]="getFieldErrorClass(container, 'code')" [ngStyle]="getFieldErrorStyle(container, 'code')" />
                  <small *ngIf="getFieldError(container, 'code')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(container, 'code') }}</small>
                </div>
              </ng-container>
              <ng-template #codeText>{{ container.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="container.isNew || container.isEditing; else descText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="container.description" (ngModelChange)="onFieldChange(container, 'description', container.description)" [ngClass]="getFieldErrorClass(container, 'description')" [ngStyle]="getFieldErrorStyle(container, 'description')" />
                  <small *ngIf="getFieldError(container, 'description')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(container, 'description') }}</small>
                </div>
              </ng-container>
              <ng-template #descText>{{ container.description }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="container.isEditing || container.isNew; else statusText">
                <p-dropdown
                  [options]="statuses"
                  [(ngModel)]="container.status"
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
                    'text-green-700 bg-green-100': container.status === 'Active',
                    'text-red-700 bg-red-100': container.status === 'Inactive',
                  }"
                >
                  {{ container.status }}
                </span>
              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(container)"
                  title="Edit"
                  *ngIf="!container.isEditing && !container.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="saveRow(container)"
                  title="Save"
                  [disabled]="!isContainerValid(container)"
                  *ngIf="container.isEditing || container.isNew"
                ></button>
                <button
                  *ngIf="container.isNew"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm"
                  severity="danger"
                  (click)="deleteRow(container)"
                  title="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Containers: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [],
})
export class ContainerCodeComponent implements OnInit, OnDestroy {
  containers: any[] = [];
  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  // Field validation states
  fieldErrors: { [key: string]: { [fieldName: string]: string } } = {};
  private contextSubscription: Subscription | undefined;

  constructor(
    private containerService: ContainerCodeService,
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
      console.log('Context changed in ContainerCodeComponent, reloading data...');
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
    const containerFilter = config?.validation?.containerFilter || '';
    
    // Determine if we should filter by context based on validation settings
    const filterByContext = containerFilter.includes('Company') || 
                           containerFilter.includes('Branch') || 
                           containerFilter.includes('Department');
    
    console.log('Container filter:', containerFilter);
    console.log('Filter by context:', filterByContext);
    
    // The BaseMasterService automatically handles context filtering
    // so we don't need to pass any parameters to getContainers()
    this.containerService.getContainers().subscribe({
      next: (data) => {
        this.containers = data || [];
        console.log('Containers loaded:', this.containers.length);
      },
      error: (error) => {
        console.error('Error loading containers:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load container codes' 
        });
        this.containers = [];
      }
    });
  }

  // Validation methods
  validateField(container: any, fieldName: string, value: any): string {
    switch (fieldName) {
      case 'code':
        if (!value || value.toString().trim() === '') {
          return ' *Code is required';
        }
        if (container.isNew && this.isCodeDuplicate(container, value)) {
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

  onFieldChange(container: any, fieldName: string, value: any) {
    const error = this.validateField(container, fieldName, value);
    if (!this.fieldErrors[container.code || 'new']) {
      this.fieldErrors[container.code || 'new'] = {};
    }
    if (error) {
      this.fieldErrors[container.code || 'new'][fieldName] = error;
    } else {
      delete this.fieldErrors[container.code || 'new'][fieldName];
    }
  }

  isCodeDuplicate(container: any, code: string): boolean {
    if (!container.isNew) return false;
    const codeValue = code.trim().toLowerCase();
    return this.containers.some(c => 
      c !== container && 
      (c.code || '').trim().toLowerCase() === codeValue
    );
  }

  getFieldErrorClass(container: any, fieldName: string): string {
    const errors = this.fieldErrors[container.code || 'new'];
    return errors && errors[fieldName] ? 'p-invalid' : '';
  }

  getFieldErrorStyle(container: any, fieldName: string): { [key: string]: string } {
    const errors = this.fieldErrors[container.code || 'new'];
    return errors && errors[fieldName] ? { 'border-color': '#f44336' } : {};
  }

  getFieldError(container: any, fieldName: string): string {
    const errors = this.fieldErrors[container.code || 'new'];
    return errors ? errors[fieldName] || '' : '';
  }

  isContainerValid(container: any): boolean {
    // For existing containers, check if basic required fields are present
    if (!container.isNew && container.code && container.description) {
      const errors = this.fieldErrors[container.code || 'new'];
      if (!errors) {
        // No validation errors recorded, check basic field requirements
        return container.code.toString().trim() !== '' && 
               container.description.toString().trim() !== '';
      }
      // If errors exist, check them
      const hasCodeError = errors['code'];
      const hasDescriptionError = errors['description'];
      return !hasCodeError && !hasDescriptionError;
    }
    
    // For new containers, require validation to have been run
    const errors = this.fieldErrors[container.code || 'new'];
    if (!errors) return false;
    
    const hasCodeError = errors['code'];
    const hasDescriptionError = errors['description'];
    
    return !hasCodeError && !hasDescriptionError && 
           container.code && container.code.toString().trim() !== '' &&
           container.description && container.description.toString().trim() !== '';
  }

  addRow() {
    console.log('Add Container button clicked - starting addRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const containerFilter = config?.validation?.containerFilter || '';
    
    console.log('Container filter:', containerFilter);
    
    // Check if we need to validate context
    if (containerFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      const missingContexts: string[] = [];
      
      if (containerFilter.includes('C') && !context.companyCode) {
        missingContexts.push('Company');
      }
      if (containerFilter.includes('B') && !context.branchCode) {
        missingContexts.push('Branch');
      }
      if (containerFilter.includes('D') && !context.departmentCode) {
        missingContexts.push('Department');
      }
      
      const contextValid = missingContexts.length === 0;
      
      console.log('Context valid:', contextValid, 'Missing contexts:', missingContexts);
      
      if (!contextValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Context Required',
          detail: `Please select ${missingContexts.join(', ')} in the context selector before adding a Container.`
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
    this.containers = [newRow, ...this.containers];
  }

  saveRow(container: any) {
    if (!this.isContainerValid(container)) return;
    
    if (container.isNew) {
      this.containerService.createContainer({
        code: container.code,
        description: container.description,
        status: container.status
      }).subscribe({
        next: (res) => {
          Object.assign(container, res, { isEditing: false, isNew: false });
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Container saved successfully' });
          this.refreshList();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
      });
    } else {
      this.containerService.updateContainer(container.code, {
        description: container.description,
        status: container.status
      }).subscribe({
        next: () => {
          container.isEditing = false;
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Container updated successfully' });
          this.refreshList();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
        }
      });
    }
  }

  editRow(container: any) {
    this.containers.forEach(c => c.isEditing = false);
    container.isEditing = true;
    container.isNew = false;
  }

  deleteRow(container: any) {
    if (container.code && !container.isNew) {
      this.containerService.deleteContainer(container.code).subscribe({
        next: () => {
          this.containers = this.containers.filter(c => c !== container);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Container deleted' });
          this.refreshList();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
        }
      });
    } else {
      this.containers = this.containers.filter(c => c !== container);
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