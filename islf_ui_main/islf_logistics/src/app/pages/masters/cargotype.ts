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

import { MasterItemService, MasterItem } from '../../services/master-item.service';
import { MasterTypeService } from '../../services/mastertype.service';
import { ContextService } from '../../services/context.service';
import {MappingService} from '@/services/mapping.service';
import {NumberSeriesService} from '@/services/number-series.service';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../services/config.service';
import { MasterTypeComponent } from './mastertype';

interface CargoTypeOption {
  key: string;
  value: string;
  status: string;
}

interface CargoType {
  id?: number;
  cargo_type: string;
  code: string;
  name: string;
  hs_code: string;
  description: string;
  active: boolean;
}

@Component({
  selector: 'cargo-type',
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
    MasterTypeComponent
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Cargo Type Master</div>

      <p-table
        #dt
        [value]="cargoTypes"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['cargo_type', 'code', 'name', 'description' , 'hs_code']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Cargo Type" icon="pi pi-plus" (click)="addRow()"></button>
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
                Cargo Type
                <p-columnFilter type="text" field="cargo_type" display="menu" placeholder="Search by cargo type"></p-columnFilter>
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

        <ng-template pTemplate="body" let-cargoType>
          <tr>
            <td>{{ cargoType.cargo_type }}</td>
            <td>{{ cargoType.code }}</td>
            <td>{{ cargoType.name }}</td>
            <td>{{cargoType.hs_code}}</td>
            <td>{{ cargoType.description }}</td>
            <td>
              <span
                class="text-sm font-semibold px-3 py-1 rounded-full"
                [ngClass]="{
                  'text-green-700 bg-green-100': cargoType.active,
                  'text-red-700 bg-red-100': !cargoType.active
                }"
              >
                {{ cargoType.active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(cargoType)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          Total Cargo Types: {{ state.totalRecords }}
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      header="{{ selectedCargoType?.isNew ? 'Add' : 'Edit' }} Cargo Type"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '600px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedCargoType" class="p-fluid form-grid dialog-body-padding">
          <div class="grid-container">
            <div class="grid-item">
              <label for="cargo_type"> Cargo Type <span class="text-red-500">*</span></label>
              <div class="flex gap-2">
                <p-dropdown
                  id="cargo_type"
                  [options]="cargoTypeOptions"
                  [(ngModel)]="selectedCargoType.cargo_type"
                  optionLabel="value"
                  optionValue="value"
                  placeholder="Select Cargo Type"
                  [filter]="true"
                  (onChange)="onFieldChange('cargo_type', $event.value)"
                  class="flex-1"
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
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('cargo_type')">{{ getFieldError('cargo_type') }}</small>
            </div>
            <div class="grid-item">
              <label for="code"> Code<span class="text-red-500">*</span></label>
              <input #codeInput id="code" pInputText [(ngModel)]="selectedCargoType.code" [disabled]="!isManualSeries || !selectedCargoType.isNew" required (input)="onFieldChange('code', codeInput.value)"/>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('code')">{{ getFieldError('code') }}</small>
            </div>
            <div class="grid-item">
              <label for="name"> Name <span class="text-red-500">*</span></label>
              <input #nameInput id="name" pInputText [(ngModel)]="selectedCargoType.name" required (input)="onFieldChange('name', nameInput.value)"/>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('name')">{{ getFieldError('name') }}</small>
            </div>
            <div class="grid-item">
              <label for="hs_code"> HS Code </label>
              <input #hsCodeInput id="hs_code" pInputText [(ngModel)]="selectedCargoType.hs_code" (input)="onFieldChange('hs_code', hsCodeInput.value)"/>
            </div>
            <div class="grid-item">
              <label for="description"> Description </label>
              <input #descriptionInput id="description" pInputText [(ngModel)]="selectedCargoType.description" (input)="onFieldChange('description', descriptionInput.value)"/>
            </div>
            <div class="grid-item">
              <label for="active">Status</label>
              <p-dropdown
                appendTo="body"
                id="active"
                [options]="activeOptions"
                [(ngModel)]="selectedCargoType.active"
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
          <button pButton label="{{ selectedCargoType?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()" [disabled]="!isFormValid()"></button>
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
export class CargoTypeMasterComponent implements OnInit, OnDestroy {
  cargoTypes: CargoType[] = [];
  cargoTypeOptions: CargoTypeOption[] = [];
  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  isDialogVisible = false;
  selectedCargoType: (CargoType & { isNew?: boolean }) | null = null;
  fieldErrors: { [key: string]: string } = {};
  showCargoTypeDialog = false;
  masterDialogLoading: { [key: string]: boolean } = {};
  private contextSubscription: Subscription | undefined;
  // number series properties
  isManualSeries:boolean = false;
  mappedCargoSeriesCode:string ='';

  constructor(
    private masterItemService: MasterItemService,
    private masterTypeService: MasterTypeService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private messageService: MessageService,
    private contextService: ContextService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef
  ) {}


  loadMappedCargoSeriesCode(){
    const context = this.contextService.getContext();
    console.log('Loading Source Cargo code for context:', context);
    
    // Use context-based mapping with NumberSeriesRelation
    this.mappingService.findMappingByContext(
      'cargoCode',
      context.companyCode || '',
      context.branchCode || '',
      context.departmentCode || '',
      context.serviceType || undefined
    ).subscribe({
      next: (contextMapping: any) => {
        console.log('source mapping relation response:', contextMapping);
        this.mappedCargoSeriesCode = contextMapping.mapping;
        if (this.mappedCargoSeriesCode) {
          this.numberSeriesService.getAll().subscribe({
            next: (seriesList: any[]) => {
              const found = seriesList.find((s: any) => s.code === this.mappedCargoSeriesCode);
              this.isManualSeries = !!(found && found.is_manual);
              console.log('cargo series code mapped:', this.mappedCargoSeriesCode, 'is Manual:', this.isManualSeries);
            },
            error: (error: any) => {
              console.error('Error loading number series:', error);
              this.isManualSeries = true;
            }
          });
        } else {
          this.isManualSeries = true;
          console.log('No source series code mapping found for context');
        }
      },
      error: (error: any) => {
        console.error('Error loading cargo mapping relation:', error);
        // Fallback to generic mapping if context-based mapping fails
        console.log('Falling back to generic mapping method');
        this.mappingService.getMapping().subscribe({
          next: (mapping: any) => {
            console.log('Fallback mapping response:', mapping);
            this.mappedCargoSeriesCode = mapping.cargoCode || '';
            if (this.mappedCargoSeriesCode) {
              this.numberSeriesService.getAll().subscribe({
                next: (seriesList: any[]) => {
                  const found = seriesList.find((s: any) => s.code === this.mappedCargoSeriesCode);
                  this.isManualSeries = !!(found && found.is_manual);
                  console.log('source series code mapped (fallback):', this.mappedCargoSeriesCode, 'Manual:', this.isManualSeries);
                },
                error: (error: any) => {
                  console.error('Error loading number series (fallback):', error);
                  this.isManualSeries = true; // Default to manual if error
                }
              });
            } else {
              this.isManualSeries = true; // Default to manual if no mapping
            }
          },
          error: (error: any) => {
            console.error('Error loading fallback mapping:', error);
            this.isManualSeries = true; // Default to manual if error
          }
        });
      }
    });
  }

  ngOnInit() {
    this.refreshList();
    this.loadCargoTypeOptions();
    // loading the mapped charges code
    this.loadMappedCargoSeriesCode();
    
    // Subscribe to context changes and reload data when context changes
    this.contextSubscription = this.contextService.context$.subscribe(() => {
      console.log('Context changed in CargoTypeMasterComponent, reloading data...');
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
    console.log('Refreshing cargo types list');
    
    // Load cargo types from master_item where item_type = 'CARGO_TYPE'
    this.masterItemService.getAll().subscribe({
      next: (data) => {
        // Filter for CARGO_TYPE entries and transform to CargoType format
        this.cargoTypes = (data || [])
          .filter(item => item.item_type === 'CARGO_TYPE')
          .map(item => ({
            id: item.id,
            cargo_type: item.item_type,
            code: item.code,
            name: item.name,
            hs_code: item.hs_code || '',
            description: '', 
            active: item.active
          }));
        console.log('Cargo types loaded:', this.cargoTypes.length);
      },
      error: (error) => {
        console.error('Error loading cargo types:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load cargo types' 
        });
        this.cargoTypes = [];
      }
    });
  }

  addRow() {
    console.log('Add Cargo Type button clicked - starting addRow method');
    
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
          detail: `Please select ${missingContexts.join(', ')} in the context selector before adding a Cargo Type.`
        });
        
        // Trigger the context selector
        this.contextService.showContextSelector();
        return;
      }
    }
    
    // If validation passes or no validation required, proceed with adding row
    this.selectedCargoType = {
      cargo_type: '',
      code: this.isManualSeries ? '':(this.mappedCargoSeriesCode || ''),
      name: '',
      hs_code: '',
      description: '',
      active: true,
      isNew: true
    };
    this.fieldErrors = {};
    this.isDialogVisible = true;
  }

  editRow(cargoType: CargoType) {
    this.selectedCargoType = { ...cargoType, isNew: false };
    this.fieldErrors = {};
    this.isDialogVisible = true;
  }

  validateField(field: string, value: any): string {
    if (!value || value.toString().trim() === '') {
      return `*${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
    }
    if (field === 'code' && this.selectedCargoType?.isNew && this.cargoTypes.some(i => i.code === value)) {
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
    if (!this.selectedCargoType) return false;
    const required = ['cargo_type', 'name'];
    for (const f of required) {
      if (this.validateField(f, (this.selectedCargoType as any)[f])) return false;
    }
    return true;
  }

  saveRow() {
    if (!this.selectedCargoType) return;
    // Validate all required fields on save
    ['cargo_type', 'name'].forEach(f => {
      this.onFieldChange(f, (this.selectedCargoType as any)[f]);
    });

    if (!this.isFormValid()) return;
    
    // Transform CargoType to master_item format
    const masterItemData = {
      item_type: 'CARGO_TYPE',
      code: this.selectedCargoType.code,
      name: this.selectedCargoType.name,
      hs_code: this.selectedCargoType.hs_code || '',
      active: this.selectedCargoType.active,
      masterType: 'Cargo Type'
    };

    // For automatic series, ensure code is empty so backend generates it (only for new records)
    if (!this.isManualSeries && this.selectedCargoType.isNew) {
      masterItemData.code = '';
    }
    
    const req = this.selectedCargoType.isNew
      ? this.masterItemService.create(masterItemData)
      : this.masterItemService.update(this.selectedCargoType.id!, masterItemData);
    req.subscribe({
      next: () => {
        const msg = this.selectedCargoType?.isNew ? 'Cargo Type created' : 'Cargo Type updated';
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
    this.selectedCargoType = null;
    this.fieldErrors = {};
  }

  clear(table: any) {
    table.clear();
  }

  openMaster(type: string) {
    // Prevent multiple clicks and show loading state
    if (this.masterDialogLoading[type]) {
      return;
    }
    
    this.masterDialogLoading[type] = true;
    
    // Open dialog immediately for better user experience
    if (type === 'cargoType') {
      this.showCargoTypeDialog = true;
    } else {
      this.messageService.add({ severity: 'info', summary: 'Open Master', detail: `Open ${type} master page` });
    }
    
    // Reset loading state immediately since dialog is now open
    this.masterDialogLoading[type] = false;
    this.cdr.detectChanges();
  }

  closeMasterDialog(type: string) {
    console.log(`Closing master dialog: ${type}`);
    
    // Reset the appropriate dialog visibility
    switch (type) {
      case 'cargoType':
        this.showCargoTypeDialog = false;
        // Refresh cargo type options when dialog closes
        this.loadCargoTypeOptions();
        break;
      default:
        console.warn(`Unknown master dialog type: ${type}`);
    }
    
    // Reset loading state if it exists
    if (this.masterDialogLoading[type]) {
      this.masterDialogLoading[type] = false;
    }
    
    // Force change detection to ensure UI updates
    this.cdr.detectChanges();
  }

  private loadCargoTypeOptions() {
    // Load cargo type options from master_type for dropdown
    this.masterTypeService.getAll().subscribe({
      next: (types: CargoTypeOption[]) => {
        this.cargoTypeOptions = types.filter(t => t.key === 'CARGO_TYPE' && t.status === 'Active');
        console.log('Cargo type options refreshed:', this.cargoTypeOptions.length);
      },
      error: (error) => {
        console.error('Error loading cargo type options:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to refresh cargo type options' 
        });
      }
    });
  }
}
