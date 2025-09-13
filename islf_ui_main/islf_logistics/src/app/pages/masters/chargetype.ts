import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { MasterTypeComponent } from './mastertype';
import { MasterItemService, MasterItem } from '../../services/master-item.service';
import { MasterTypeService } from '../../services/mastertype.service';
import { ContextService } from '../../services/context.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../services/config.service';

interface ChargeTypeOption {
  key: string;
  value: string;
  status: string;
}

interface ChargeType {
  id?: number;
  charge_type: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
}

@Component({
  selector: 'charge-type',
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
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Charge Type Master</div>

      <p-table
        #dt
        [value]="chargeTypes"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['charge_type', 'code', 'name','description']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Charge Type" icon="pi pi-plus" (click)="addRow()"></button>
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
                Charge Type
                <p-columnFilter type="text" field="charge_type" display="menu" placeholder="Search by charge type"></p-columnFilter>
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
                Name
                <p-columnFilter type="text" field="name" display="menu" placeholder="Search by name"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Description
                <p-columnFilter type="text" field="description" display="menu" placeholder="Search by description"></p-columnFilter>
              </div>
            </th>
            <!--
            <th>
              <div class="flex justify-between items-center">
                HS Code
                <p-columnFilter type="text" field="hs_code" display="menu" placeholder="Search by HS code"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Description
                <p-columnFilter type="text" field="description" display="menu" placeholder="Search by description"></p-columnFilter>
              </div>
            </th>
            -->
            <th>
              <div class="flex justify-between items-center">
                Status
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

        <ng-template pTemplate="body" let-chargeType>
          <tr>
            <td>{{ chargeType.charge_type }}</td>
            <td>{{ chargeType.code }}</td>
            <td>{{ chargeType.name }}</td>
            <!--<td>{{ chargeType.hs_code }}</td>-->
            <td>{{ chargeType.description }}</td>
            <td>
              <span
                class="text-sm font-semibold px-3 py-1 rounded-full"
                [ngClass]="{
                  'text-green-700 bg-green-100': chargeType.active,
                  'text-red-700 bg-red-100': !chargeType.active
                }"
              >
                {{ chargeType.active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(chargeType)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          Total Charge Types: {{ state.totalRecords }}
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      header="{{ selectedChargeType?.isNew ? 'Add' : 'Edit' }} Charge Type"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '600px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedChargeType" class="p-fluid form-grid dialog-body-padding">
          <div class="grid-container">
             <div class="grid-item">
               <label for="charge_type"> Charge Type <span class="text-red-500">*</span></label>
               <div class="flex gap-2">
               <p-dropdown
                 id="charge_type"
                 [options]="chargeTypeOptions"
                 [(ngModel)]="selectedChargeType.charge_type"
                 optionLabel="value"
                 optionValue="value"
                 placeholder="Select Charge Type"
                 [filter]="true"
                 (onChange)="onFieldChange('charge_type', $event.value)"
               ></p-dropdown>
               <button 
                  pButton 
                  type="button" 
                  icon="pi pi-ellipsis-h" 
                  class="p-button-sm" 
                  [loading]="masterDialogLoading['cargoType']" 
                  (click)="openMaster('cargoType')"
                  title="Open Cargo Type Master"
                ></button>
                </div>
               <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('charge_type')">{{ getFieldError('charge_type') }}</small>
             </div>
            <div class="grid-item">
              <label for="code"> Code<span class="text-red-500">*</span></label>
              <input #codeInput id="code" pInputText [(ngModel)]="selectedChargeType.code" [disabled]="!selectedChargeType.isNew" required (input)="onFieldChange('code', codeInput.value)"/>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('code')">{{ getFieldError('code') }}</small>
            </div>
            <div class="grid-item">
              <label for="name"> Name <span class="text-red-500">*</span></label>
              <input #nameInput id="name" pInputText [(ngModel)]="selectedChargeType.name" required (input)="onFieldChange('name', nameInput.value)"/>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('name')">{{ getFieldError('name') }}</small>
            </div>
            <!-- Removed Hs code validation as it's optional 
            <div class="grid-item">
              <label for="hs_code"> HS Code </label>
              <input #hsCodeInput id="hs_code" pInputText [(ngModel)]="selectedChargeType.hs_code" (input)="onFieldChange('hs_code', hsCodeInput.value)"/>
            </div>
            -->
            <div class="grid-item">
              <label for="description"> Description </label>
              <input #descriptionInput id="description" pInputText [(ngModel)]="selectedChargeType.description" (input)="onFieldChange('description', descriptionInput.value)"/>
            </div>
            
            <div class="grid-item">
              <label for="active">Status</label>
              <p-dropdown
                appendTo="body"
                id="active"
                [options]="activeOptions"
                [(ngModel)]="selectedChargeType.active"
                optionLabel="label"
                optionValue="value"
              ></p-dropdown>
            </div>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="hideDialog()"></button>
          <button pButton label="{{ selectedChargeType?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()" [disabled]="!isFormValid()"></button>
        </div>
      </ng-template>
    </p-dialog>
     <!-- Cargo Type Master Dialog -->
    <p-dialog
      header="Cargo Type Master (CARGO_TYPE only)"
      [(visible)]="showCargoTypeDialog"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('cargoType')"
    >
      <ng-template pTemplate="content">
        <master-type [filterByKey]="'CARGO_TYPE'"></master-type>
      </ng-template>
    </p-dialog>
    

  `,
  styles: [`
    .grid-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    .grid-item {
      display: flex;
      flex-direction: column;
    }
    label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class ChargeTypeMasterComponent implements OnInit, OnDestroy {
  chargeTypes: ChargeType[] = [];
  chargeTypeOptions: ChargeTypeOption[] = [];
  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  isDialogVisible = false;
  selectedChargeType: (ChargeType & { isNew?: boolean }) | null = null;
  fieldErrors: { [key: string]: string } = {};
  private contextSubscription: Subscription | undefined;

  constructor(
    private masterItemService: MasterItemService,
    private masterTypeService: MasterTypeService,
    private messageService: MessageService,
    private contextService: ContextService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.refreshList();
    this.loadChargeTypeOptions();
    
    // Subscribe to context changes and reload data when context changes
    this.contextSubscription = this.contextService.context$.subscribe(() => {
      console.log('Context changed in ChargeTypeMasterComponent, reloading data...');
      this.refreshList();
    });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refreshList() {
    console.log('Refreshing charge types list');
    
    // Load charge types from master_item where item_type = 'CHARGE_TYPE'
    this.masterItemService.getAll().subscribe({
      next: (data) => {
        // Filter for CHARGE_TYPE entries and transform to ChargeType format
        this.chargeTypes = (data || [])
          .filter(item => item.item_type === 'CHARGE_TYPE')
          .map(item => ({
            id: item.id,
            charge_type: item.item_type,
            code: item.code,
            name: item.name,
            description:'',
            active: item.active
          }));
        console.log('Charge types loaded:', this.chargeTypes.length);
      },
      error: (error) => {
        console.error('Error loading charge types:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load charge types' 
        });
        this.chargeTypes = [];
      }
    });
  }

  addRow() {
    console.log('Add Charge Type button clicked - starting addRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const itemFilter = config?.validation?.itemFilter || '';
    
    console.log('Item filter:', itemFilter);
    
    // Check if we need to validate context
    if (itemFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      const missingContexts: string[] = [];
      
      if (itemFilter.includes('C') && !context.companyCode) {
        missingContexts.push('Company');
      }
      if (itemFilter.includes('B') && !context.branchCode) {
        missingContexts.push('Branch');
      }
      if (itemFilter.includes('D') && !context.departmentCode) {
        missingContexts.push('Department');
      }
      
      const contextValid = missingContexts.length === 0;
      
      console.log('Context valid:', contextValid, 'Missing contexts:', missingContexts);
      
      if (!contextValid) {
        this.messageService.add({
          severity: 'error',
          summary: 'Context Required',
          detail: `Please select ${missingContexts.join(', ')} in the context selector before adding a Charge Type.`
        });
        
        // Trigger the context selector
        this.contextService.showContextSelector();
        return;
      }
    }
    
     // If validation passes or no validation required, proceed with adding row
     this.selectedChargeType = {
       charge_type: this.chargeTypeOptions.length > 0 ? this.chargeTypeOptions[0].value : '',
       code: '',
       name: '',
       description:'',
       active: true,
       isNew: true
     };
    this.fieldErrors = {};
    this.isDialogVisible = true;
  }

  editRow(chargeType: ChargeType) {
    this.selectedChargeType = { ...chargeType, isNew: false };
    this.fieldErrors = {};
    this.isDialogVisible = true;
  }

  validateField(field: string, value: any): string {
    if (!value || value.toString().trim() === '') {
      return `*${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }
    if (field === 'code' && this.selectedChargeType?.isNew && this.chargeTypes.some(i => i.code === value)) {
      return '*Code already exists';
    }
    return '';
  }

  onFieldChange(field: string, value: any) {
    const error = this.validateField(field, value);
    if (error) {
      this.fieldErrors[field] = error;
    } else {
      delete this.fieldErrors[field];
    }
  }

  getFieldError(field: string): string {
    return this.fieldErrors[field] || '';
  }

  isFormValid(): boolean {
    if (!this.selectedChargeType) return false;
    const required = ['charge_type', 'code', 'name'];
    for (const f of required) {
      if (this.validateField(f, (this.selectedChargeType as any)[f])) return false;
    }
    return true;
  }

  saveRow() {
    if (!this.selectedChargeType) return;
    // Validate all required fields on save
    ['charge_type', 'code', 'name'].forEach(f => {
      this.onFieldChange(f, (this.selectedChargeType as any)[f]);
    });
    if (!this.isFormValid()) return;
    
     // Transform ChargeType to master_item format
     const masterItemData = {
       item_type: 'CHARGE_TYPE',
       code: this.selectedChargeType.code,
       name: this.selectedChargeType.name,
       hs_code: '', // Empty string since HS code is not needed for charge type
       active: this.selectedChargeType.active,
       masterType: 'Charge Type'
     };
    
    const req = this.selectedChargeType.isNew
      ? this.masterItemService.create(masterItemData)
      : this.masterItemService.update(this.selectedChargeType.id!, masterItemData);
    req.subscribe({
      next: () => {
        const msg = this.selectedChargeType?.isNew ? 'Charge Type created' : 'Charge Type updated';
        this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
        this.refreshList();
        this.hideDialog();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed' });
      }
    });
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedChargeType = null;
    this.fieldErrors = {};
  }

  clear(table: any) {
    table.clear();
  }


  private loadChargeTypeOptions() {
    // Load charge type options from master_type for dropdown
    this.masterTypeService.getAll().subscribe({
      next: (types: ChargeTypeOption[]) => {
        this.chargeTypeOptions = types.filter(t => t.key === 'CHARGE_TYPE' && t.status === 'Active');
        console.log('Charge type options refreshed:', this.chargeTypeOptions.length);
      },
      error: (error) => {
        console.error('Error loading charge type options:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to refresh charge type options' 
        });
      }
    });
  }
}
