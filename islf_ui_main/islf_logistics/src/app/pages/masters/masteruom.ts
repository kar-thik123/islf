import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { MasterUOMService, MasterUOM } from '../../services/master-uom.service';
import { MasterTypeService } from '../../services/mastertype.service';
import { ContextService } from '../../services/context.service';
import { ConfigService } from '../../services/config.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MasterTypeComponent } from './mastertype';

@Component({
  selector: 'master-uom',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
    DialogModule,
    CalendarModule,
    MasterTypeComponent
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Master UOM</div>

      <p-table
        #dt
        [value]="uoms"
        dataKey="code"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['uom_type', 'code', 'description', 'active']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add UOM" icon="pi pi-plus" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <span class="ml-auto">
              <input pInputText type="text" (input)="onGlobalFilter($event, dt)" placeholder="Search keyword" />
            </span>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                UOM Type
                <p-columnFilter type="text" field="uom_type" display="menu" placeholder="Search by type"></p-columnFilter>
              </div>
            </th>
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
                Active
                <p-columnFilter field="active" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="activeOptions"
                      (onChange)="filter($event.value)"
                      placeholder="Any"
                      styleClass="w-full"
                      optionLabel="label"
                      optionValue="value"
                    ></p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-uom let-rowIndex="rowIndex">
          <tr>
            <td>
              <ng-container *ngIf="uom.isNew || uom.isEditing; else typeText">
                <div class="flex flex-col">
                  <div class="flex gap-2">
                    <p-dropdown
                      [options]="uomTypeOptions"
                      [(ngModel)]="uom.uom_type"
                      optionLabel="value"
                      optionValue="value"
                      placeholder="Select Type"
                      [filter]="true"
                      (ngModelChange)="onFieldChange(uom, 'uom_type', uom.uom_type)"
                      [ngClass]="getFieldErrorClass(uom, 'uom_type')"
                      appendTo="body"
                      class="flex-1"
                    ></p-dropdown>
                    <button 
                      pButton 
                      type="button" 
                      icon="pi pi-ellipsis-h" 
                      class="p-button-sm" 
                      [loading]="masterDialogLoading['uomType']" 
                      (click)="openMaster('uomType')"
                      title="Open UOM Type Master"
                    ></button>
                  </div>
                  <small *ngIf="getFieldError(uom, 'uom_type')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(uom, 'uom_type') }}</small>
                </div>
              </ng-container>
              <ng-template #typeText>{{ uom.uom_type }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="uom.isNew || uom.isEditing; else codeText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="uom.code" (ngModelChange)="onFieldChange(uom, 'code', uom.code)" [ngClass]="getFieldErrorClass(uom, 'code')" [ngStyle]="getFieldErrorStyle(uom, 'code')" [disabled]="!uom.isNew" />
                  <small *ngIf="getFieldError(uom, 'code')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(uom, 'code') }}</small>
                </div>
              </ng-container>
              <ng-template #codeText>{{ uom.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="uom.isNew || uom.isEditing; else descText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="uom.description" (ngModelChange)="onFieldChange(uom, 'description', uom.description)" [ngClass]="getFieldErrorClass(uom, 'description')" [ngStyle]="getFieldErrorStyle(uom, 'description')" />
                  <small *ngIf="getFieldError(uom, 'description')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(uom, 'description') }}</small>
                </div>
              </ng-container>
              <ng-template #descText>{{ uom.description }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="uom.isEditing || uom.isNew; else statusText">
                <p-dropdown
                  [options]="activeOptions"
                  [(ngModel)]="uom.active"
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
                    'text-green-700 bg-green-100': uom.active,
                    'text-red-700 bg-red-100': !uom.active
                  }"
                >
                  {{ uom.active ? 'Active' : 'Inactive' }}
                </span>
              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(uom)"
                  title="Edit"
                  *ngIf="!uom.isEditing && !uom.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="saveRow(uom)"
                  title="Save"
                  [disabled]="!isUOMValid(uom)"
                  *ngIf="uom.isEditing || uom.isNew"
                ></button>
                <button
                  *ngIf="uom.isNew"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm"
                  severity="danger"
                  (click)="deleteRow(uom)"
                  title="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          Total UOMs: {{ state.totalRecords }}
        </ng-template>
      </p-table>
    </div>

    <!-- UOM Type Master Dialog -->
    <p-dialog
      header="UOM Type Master (UOM only)"
      [(visible)]="showUomTypeDialog"
      [modal]="true"
      [style]="{ width: '900px' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('uomType')"
    >
      <ng-template pTemplate="content">
        <master-type [filterByKey]="'UOM'"></master-type>
      </ng-template>
    </p-dialog>
  `,
  styles: []
})
export class MasterUOMComponent implements OnInit, OnDestroy {
  uoms: (MasterUOM & { isNew?: boolean; isEditing?: boolean })[] = [];
  uomTypeOptions: any[] = [];
  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  // Field validation states
   fieldErrors: { [key: string]: { [fieldName: string]: string } } = {};
   showUomTypeDialog = false;
   masterDialogLoading: { [key: string]: boolean } = {};
  private contextSubscription: Subscription | undefined;

  constructor(
    private masterUOMService: MasterUOMService,
    private masterTypeService: MasterTypeService,
    private messageService: MessageService,
    private contextService: ContextService,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.refreshList();
    // Load UOM types for dropdown
    this.loadUomTypeOptions();
    
    // Subscribe to context changes and reload data when context changes
    this.contextSubscription = this.contextService.context$.pipe(
      debounceTime(300), // Wait 300ms after the last context change
      distinctUntilChanged() // Only emit when context actually changes
    ).subscribe(() => {
      console.log('Context changed in MasterUOMComponent, reloading data...');
      this.refreshList();
    });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  refreshList() {
    this.masterUOMService.getAll().subscribe({
      next: (data) => {
        this.uoms = data.map(uom => ({ ...uom, isEditing: false, isNew: false }));
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load UOMs' });
      }
    });
  }

  addRow() {
    console.log('Add UOM button clicked - starting addRow method');
    
    // Get the Validation settings
    const config = this.configService.getConfig();
    const uomFilter = config?.validation?.uomFilter || '';
    
    console.log('UOM filter:', uomFilter);
    
    // Check if we need to validate context
    if (uomFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      let contextValid = true;
      let missingContexts = [];
      
      if (uomFilter.includes('C') && !context.companyCode) {
        contextValid = false;
        missingContexts.push('Company');
      }
      
      if (uomFilter.includes('B') && !context.branchCode) {
        contextValid = false;
        missingContexts.push('Branch');
      }
      
      if (uomFilter.includes('D') && !context.departmentCode) {
        contextValid = false;
        missingContexts.push('Department');
      }
      
      if (uomFilter.includes('ST') && !context.serviceType) {
        contextValid = false;
        missingContexts.push('Service Type');
      }
      
      console.log('Context valid:', contextValid);
      console.log('Missing contexts:', missingContexts);
      
      // If context is not valid, show an error message and trigger the context selector
      if (!contextValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Context Required',
          detail: `Please select ${missingContexts.join(', ')} in the context selector before adding a UOM.`
        });
        
        // Trigger the context selector
        this.contextService.showContextSelector();
        return;
      }
    }
    
    // If validation passes or no validation required, proceed with adding row
    const newRow = {
      id: undefined,
      uom_type: '',
      code: '',
      description: '',
      active: true,
      isEditing: true,
      isNew: true
    };
    this.uoms = [newRow, ...this.uoms];
  }

  editRow(uom: any) {
    // Close any other editing rows
    this.uoms.forEach(u => u.isEditing = false);
    uom.isEditing = true;
    uom.isNew = false;
  }

  saveRow(uom: any) {
    if (!this.isUOMValid(uom)) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fix the validation errors before saving.' });
      return;
    }

    if (uom.isNew) {
      this.masterUOMService.create(uom).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'UOM created' });
          this.refreshList();
        },
        error: () =>
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create UOM' })
      });
    } else {
      if (!uom.id) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Missing UOM ID for update' });
        return;
      }

      this.masterUOMService.update(uom.id, uom).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'UOM updated' });
          this.refreshList();
        },
        error: () =>
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update UOM' })
      });
    }
  }

  deleteRow(uom: any) {
    if (uom.id && !uom.isNew) {
      this.masterUOMService.delete(uom.id).subscribe({
        next: () => {
          this.uoms = this.uoms.filter(u => u !== uom);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'UOM deleted' });
          this.refreshList();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
        }
      });
    } else {
      this.uoms = this.uoms.filter(u => u !== uom);
    }
  }

  // Field validation methods
  onFieldChange(uom: any, fieldName: string, value: any) {
    this.validateField(uom, fieldName, value);
  }

  validateField(uom: any, fieldName: string, value: any) {
    const uomKey = this.getUOMKey(uom);
    
    if (!this.fieldErrors[uomKey]) {
      this.fieldErrors[uomKey] = {};
    }

    // Clear previous error
    delete this.fieldErrors[uomKey][fieldName];

    // Validate required fields
    if (['uom_type', 'code', 'description'].includes(fieldName)) {
      if (!value || value.toString().trim() === '') {
        this.fieldErrors[uomKey][fieldName] = `${this.getFieldLabel(fieldName)} is required`;
        return;
      }
    }

    // Additional validation for code (no spaces, special characters)
    if (fieldName === 'code' && value) {
      if (!/^[A-Za-z0-9_-]+$/.test(value)) {
        this.fieldErrors[uomKey][fieldName] = 'Code can only contain letters, numbers, hyphens, and underscores';
        return;
      }
    }
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'uom_type': 'UOM Type',
      'code': 'Code',
      'description': 'Description'
    };
    return labels[fieldName] || fieldName;
  }

  getUOMKey(uom: any): string {
    return uom.id ? uom.id.toString() : `new_${this.uoms.indexOf(uom)}`;
  }

  getFieldError(uom: any, fieldName: string): string | null {
    const uomKey = this.getUOMKey(uom);
    return this.fieldErrors[uomKey]?.[fieldName] || null;
  }

  getFieldErrorClass(uom: any, fieldName: string): string {
    return this.getFieldError(uom, fieldName) ? 'p-invalid' : '';
  }

  getFieldErrorStyle(uom: any, fieldName: string): any {
    return this.getFieldError(uom, fieldName) ? { 'border-color': '#e24c4c' } : {};
  }

  isUOMValid(uom: any): boolean {
        // For existing containers, check if basic required fields are present
    if (!uom.isNew &&  uom.type && uom.code && uom.description) {
      const errors = this.fieldErrors[uom.code || 'new'];
      if (!errors) {
        // No validation errors recorded, check basic field requirements
        return uom.uom_type.toString().trim() !== '' && 
               uom.code.toString().trim() !== '' &&
               uom.description.toString().trim() !== '';
      }
      // If errors exist, check them
      const hasUOMTypeError = errors['uom_type'];
      const hasCodeError = errors['code'];
      const hasDescriptionError = errors['description'];
      return !hasUOMTypeError && !hasCodeError && !hasDescriptionError;
    }
    const uomKey = this.getUOMKey(uom);
    const errors = this.fieldErrors[uomKey];
    
    // Check if there are any validation errors
    if (errors && Object.keys(errors).length > 0) {
      return false;
    }
    
    // Check required fields
    return !!(uom.uom_type && uom.code && uom.description);
  }

  clear(table: any) {
    table.clear();
  }

  onGlobalFilter(event: Event, table: any) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  openMaster(type: string) {
    // Prevent multiple clicks and show loading state
    if (this.masterDialogLoading[type]) {
      return;
    }
    
    this.masterDialogLoading[type] = true;
    
    // Open dialog immediately for better user experience
    if (type === 'uomType') {
      this.showUomTypeDialog = true;
    } else {
      this.messageService.add({ severity: 'info', summary: 'Open Master', detail: `Open ${type} master page` });
    }
    
    // Reset loading state immediately since dialog is now open
    this.masterDialogLoading[type] = false;
  }

  closeMasterDialog(type: string) {
    console.log(`Closing master dialog: ${type}`);
    
    // Reset the appropriate dialog visibility
    switch (type) {
      case 'uomType':
        this.showUomTypeDialog = false;
        // Refresh UOM type options when dialog closes
        this.loadUomTypeOptions();
        break;
      default:
        console.warn(`Unknown master dialog type: ${type}`);
    }
    
    // Reset loading state if it exists
    if (this.masterDialogLoading[type]) {
      this.masterDialogLoading[type] = false;
    }
  }

  private loadUomTypeOptions() {
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        this.uomTypeOptions = types.filter(t => t.key === 'UOM' && t.status === 'Active');
        console.log('UOM type options refreshed:', this.uomTypeOptions.length);
      },
      error: (error) => {
        console.error('Error loading UOM type options:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to refresh UOM type options' 
        });
      }
    });
  }
}
