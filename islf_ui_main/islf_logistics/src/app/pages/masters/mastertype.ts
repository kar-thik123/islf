import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { MasterCodeService } from '../../services/mastercode.service';
import { MasterTypeService } from '../../services/mastertype.service';
import { ContextService } from '@/services/context.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MasterCodeComponent } from './mastercode';

@Component({
  selector: 'master-type',
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
    MasterCodeComponent
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Master Type</div>
      <p-table
        #dt
        [value]="types"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['key', 'value', 'description', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Type" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <span class="ml-auto">
              <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
            </span>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Key
                <p-columnFilter type="text" field="key" display="menu" placeholder="Search by key" ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Value
                <p-columnFilter type="text" field="value" display="menu" placeholder="Search by value"></p-columnFilter>
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
        <ng-template pTemplate="body" let-type let-rowIndex="rowIndex">
          <tr>
            <td>
              <ng-container *ngIf="type.isNew; else keyText">
                <div class="flex flex-col">
                  <div class="flex gap-2">
                    <p-dropdown
                      [options]="masterCodeOptions"
                      [(ngModel)]="type.key"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Select Key"
                      appendTo="body"
                      [filter]="true"
                      filterBy="label"
                      [disabled]="!!(filterByKey && filterByKey.trim() !== '')"
                      (onChange)="onFieldChange(type, 'key', $event.value)"
                      [ngClass]="getFieldErrorClass(type, 'key')"
                      [ngStyle]="getFieldErrorStyle(type, 'key')"
                      class="flex-1"
                    ></p-dropdown>
                    <button 
                      pButton 
                      type="button" 
                      icon="pi pi-ellipsis-h" 
                      class="p-button-sm" 
                      [loading]="masterDialogLoading['masterCode']" 
                      (click)="openMaster('masterCode')"
                      title="Open Master Code"
                    ></button>
                  </div>
                  <small *ngIf="getFieldError(type, 'key')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(type, 'key') }}</small>
                </div>
              </ng-container>
              <ng-template #keyText>{{ type.key }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="type.isNew || type.isEditing; else valueText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="type.value" (ngModelChange)="onFieldChange(type, 'value', type.value)"
                    [ngClass]="getFieldErrorClass(type, 'value')"
                    [ngStyle]="getFieldErrorStyle(type, 'value')"
                    class="w-full"
                  />
                  <small *ngIf="getFieldError(type, 'value')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(type, 'value') }}</small>
                </div>
              </ng-container>
              <ng-template #valueText>{{ type.value }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="type.isNew || type.isEditing; else descText">
                <input pInputText [(ngModel)]="type.description" />
              </ng-container>
              <ng-template #descText>{{ type.description }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="type.isEditing || type.isNew; else statusText">
                <p-dropdown
                  [options]="statuses"
                  [(ngModel)]="type.status"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Status"
                  appendTo="body"
                  [filter]="true"
                  filterBy="label"
                ></p-dropdown>
              </ng-container>
              <ng-template #statusText>
                <span
                class="text-sm font-semibold px-3 py-1 rounded-full"
                  [ngClass]="{
                    'text-green-700 bg-green-100': type.status === 'Active',
                    'text-red-700 bg-red-100': type.status === 'Inactive'
                  }"
                >
                  {{ type.status }}
                </span>
              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(type)"
                  title="Edit"
                  *ngIf="!type.isEditing && !type.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="saveRow(type)"
                  title="Save"
                  *ngIf="type.isEditing || type.isNew"
                  [disabled]="!isTypeValid(type)"
                ></button>
                <button
                *ngIf="type.isNew"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm"
                  severity="danger"
                  (click)="deleteRow(type)"
                  title="Delete"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Types: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
    
    <!-- Master Code Dialog -->
    <p-dialog 
      header="Master Code" 
      [(visible)]="masterDialogVisible['masterCode']" 
      [modal]="true" 
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [draggable]="false" 
      [resizable]="false"
      (onHide)="closeMasterDialog('masterCode')"
    >
      <master-code></master-code>
    </p-dialog>
  `,
  styles: [],
})
export class MasterTypeComponent implements OnInit, OnDestroy {
  @Input() filterByKey: string = ''; // Filter types by specific key
  types: any[] = [];
  activeTypes: any[] = [];
  masterCodeOptions: any[] = [];
  private contextSubscription: Subscription | undefined;
  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  // Field validation states
  fieldErrors: { [key: string]: { [fieldName: string]: string } } = {};

  // Master dialog states
  masterDialogVisible: { [key: string]: boolean } = {
    masterCode: false
  };
  masterDialogLoading: { [key: string]: boolean } = {
    masterCode: false
  };

  constructor(
    private masterCodeService: MasterCodeService,
    private masterTypeService: MasterTypeService,
    private messageService: MessageService,
    private contextService: ContextService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  // Validation methods
  validateField(type: any, fieldName: string, value: any): string {
    switch (fieldName) {
      case 'key':
        if (!value || value.toString().trim() === '') {
          return ' *Key is required';
        }
        if (type.isNew && this.isKeyValueDuplicate(type, value, type.value)) {
          return ' *Key-Value combination already exists';
        }
        break;
      case 'value':
        if (!value || value.toString().trim() === '') {
          return ' *Value is required';
        }
        if (type.isNew && this.isKeyValueDuplicate(type, type.key, value)) {
          return ' *Key-Value combination already exists';
        }
        break;
    }
    return '';
  }

  onFieldChange(type: any, fieldName: string, value: any) {
    const error = this.validateField(type, fieldName, value);
    if (!this.fieldErrors[type.id || 'new']) {
      this.fieldErrors[type.id || 'new'] = {};
    }
    if (error) {
      this.fieldErrors[type.id || 'new'][fieldName] = error;
    } else {
      delete this.fieldErrors[type.id || 'new'][fieldName];
    }
  }

  isKeyValueDuplicate(type: any, key: string, value: string): boolean {
    if (!type.isNew) return false;
    const keyValue = key.trim().toLowerCase();
    const valueValue = value.trim().toLowerCase();
    return this.types.some(t => 
      t !== type && 
      (t.key || '').trim().toLowerCase() === keyValue &&
      (t.value || '').trim().toLowerCase() === valueValue
    );
  }

  getFieldErrorClass(type: any, fieldName: string): string {
    const errors = this.fieldErrors[type.id || 'new'];
    return errors && errors[fieldName] ? 'p-invalid' : '';
  }

  getFieldErrorStyle(type: any, fieldName: string): { [key: string]: string } {
    const errors = this.fieldErrors[type.id || 'new'];
    return errors && errors[fieldName] ? { 'border-color': '#f44336' } : {};
  }

  getFieldError(type: any, fieldName: string): string {
    const errors = this.fieldErrors[type.id || 'new'];
    return errors ? errors[fieldName] || '' : '';
  }

  isTypeValid(type: any): boolean {
    // For existing type, check if basic required fields are present
    if (!type.isNew && type.key && type.value) {
      const errors = this.fieldErrors[type.id || 'new'];
      if (!errors) {
        // No validation errors recorded, check basic field requirements
        return type.key.toString().trim() !== '' && 
               type.value.toString().trim() !== '';
      }
      // If errors exist, check them
      const hasKeyError = errors['key'];
      const hasValueError = errors['value'];
      return !hasKeyError && !hasValueError;
    }
    
    const errors = this.fieldErrors[type.id || 'new'];
    if (!errors) return false;
    
    const hasKeyError = errors['key'];
    const hasValueError = errors['value'];
    
    return !hasKeyError && !hasValueError && 
           type.key && type.key.toString().trim() !== '' &&
           type.value && type.value.toString().trim() !== '';
  }

  ngOnInit() {
    // Load master code options for the key dropdown
    this.masterCodeService.getMasters().subscribe((codes: any[]) => {
      this.masterCodeOptions = (codes || []).map(c => ({ label: c.code, value: c.code }));
    });
    
    // 🔄 Updated context subscription to match UOM pattern
    this.contextSubscription = this.contextService.context$.pipe(
      debounceTime(300), // Wait 300ms after the last context change
      distinctUntilChanged() // Only emit when context actually changes
    ).subscribe(() => {
      console.log('Context changed in MasterTypeComponent, reloading data...');
      this.refreshList();
    });
    
    this.refreshList();
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  refreshList() {
    console.log('Refreshing master types list');
    
    try {
      // ❌ Remove this entire context validation block
      // The backend service should handle context filtering automatically
      
      this.masterTypeService.getAll().subscribe({
        next: (types) => {
          let filteredTypes = types || [];
          
          // Filter by key if filterByKey is provided
          if (this.filterByKey && this.filterByKey.trim() !== '') {
            filteredTypes = filteredTypes.filter((t: any) => t.key === this.filterByKey);
            console.log(`Filtered master types by key '${this.filterByKey}':`, filteredTypes.length);
          }
          
          this.types = filteredTypes.map((t: any) => ({
            ...t,
            isEditing: false,
            isNew: false
          }));
          this.activeTypes = this.types.filter((t: any) => t.status === 'Active');
          console.log('Master types loaded successfully:', this.types.length);
        },
        error: (error) => {
          console.error('Error loading master types:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load master types'
          });
        }
      });
    } catch (error) {
      console.error('Error in refreshList:', error);
    }
  }

  addRow() {
    console.log('Add Master Type button clicked - starting addRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const masterTypeFilter = config?.validation?.masterTypeFilter || '';
    
    console.log('Master Type filter:', masterTypeFilter);
    
    // Check if we need to validate context
    if (masterTypeFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      const missingContexts: string[] = [];
      
      if (masterTypeFilter.includes('C') && !context.companyCode) {
        missingContexts.push('Company');
      }
      if (masterTypeFilter.includes('B') && !context.branchCode) {
        missingContexts.push('Branch');
      }
      if (masterTypeFilter.includes('D') && !context.departmentCode) {
        missingContexts.push('Department');
      }
      
      if (missingContexts.length > 0) {
        console.log('Missing contexts:', missingContexts);
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: `Please select ${missingContexts.join(', ')} before adding master type`
        });
        
        // Trigger the context selector
        this.contextService.showContextSelector();
        return;
      }
    }
    
    // If validation passes or no validation required, proceed with adding row
    const newRow = {
      id: null,
      key: this.filterByKey && this.filterByKey.trim() !== '' ? this.filterByKey : null,
      value: '',
      description: '',
      status: 'Active',
      isEditing: true,
      isNew: true
    };
    
    // Add the new row to both types and activeTypes arrays
    this.types = [newRow, ...this.types];
    this.activeTypes = [newRow, ...this.activeTypes];
    
    // Clear field errors for new row
    this.fieldErrors['new'] = {};
    
    // Force change detection to update the UI
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
    
    console.log('New master type row added successfully');
  }

  saveRow(type: any) {
    if (!this.isTypeValid(type)) return;
    
    if (type.isNew) {
      this.masterTypeService.create(type).subscribe({
        next: (created) => {
          Object.assign(type, created, { isNew: false, isEditing: false });
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Type saved successfully' });
          // Force a complete refresh to ensure the UI is updated
          setTimeout(() => {
            this.refreshList();
          }, 100);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
      });
    } else {
      // Update existing record
      this.masterTypeService.update(type.id, {
        value: type.value,
        description: type.description,
        status: type.status
      }).subscribe({
        next: (updated) => {
          Object.assign(type, updated, { isEditing: false });
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Type updated' });
          this.refreshList();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Update failed' });
        }
      });
    }
  }

  editRow(type: any) {
    this.types.forEach(t => t.isEditing = false);
    type.isEditing = true;
    type.isNew = false;
    // Clear field errors for editing row
    if (this.fieldErrors[type.id]) {
      delete this.fieldErrors[type.id];
    }
  }

  deleteRow(type: any) {
    if (type.id) {
      this.masterTypeService.delete(type.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Type deleted' });
          this.refreshList();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
        }
      });
    } else {
      this.types = this.types.filter(t => t !== type);
    }
  }

  clear(table: any) {
    table.clear();
  }

  onGlobalFilter(table: any, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
  }

  getActiveTypes() {
    return this.activeTypes;
  }

  // Master dialog methods
  openMaster(masterType: string) {
    this.masterDialogVisible[masterType] = true;
  }

  closeMasterDialog(masterType: string) {
    this.masterDialogVisible[masterType] = false;
    // Refresh master code options when dialog closes
    if (masterType === 'masterCode') {
      this.loadMasterCodeOptions();
    }
  }

  private loadMasterCodeOptions() {
    this.masterCodeService.getMasters().subscribe({
      next: (codes: any[]) => {
        this.masterCodeOptions = (codes || []).map(c => ({ label: c.code, value: c.code }));
        console.log('Master code options refreshed:', this.masterCodeOptions.length);
      },
      error: (error) => {
        console.error('Error loading master code options:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to refresh master code options' 
        });
      }
    });
  }
}
