import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ServiceAreaService, ServiceArea } from '@/services/service-area.service';
import { ContextService } from '@/services/context.service';
import { ConfigService } from '@/services/config.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MasterTypeComponent } from './mastertype';
import { MasterTypeService } from '../../services/mastertype.service';
import { DialogModule } from 'primeng/dialog';
import {MappingService} from '@/services/mapping.service';
import {NumberSeriesService} from '@/services/number-series.service';

@Component({
  selector: 'app-service-area',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule,
    MasterTypeComponent,
    DialogModule,
  ],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Service Area</div>
      <p-table
        #dt
        [value]="serviceAreas"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'type', 'service_area', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Service Area" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
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
                Code
                <p-columnFilter type="text" field="code" display="menu" placeholder="Search by code"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Type
                <p-columnFilter type="text" field="type" display="menu" placeholder="Search by type"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Service Area
                <p-columnFilter type="text" field="service_area" display="menu" placeholder="Search by service area"></p-columnFilter>
              </div>
            </th>
            <th>From</th>
            <th>To</th>
            <th>
              <div class="flex justify-between items-center">
                Status
                <p-columnFilter field="status" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="statusFilterOptions"
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
        <ng-template pTemplate="body" let-serviceArea let-rowIndex="rowIndex">
          <tr>
            <td>
              <ng-container *ngIf="serviceArea.isNew; else codeText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="serviceArea.code" (ngModelChange)="onFieldChange(serviceArea, 'code', serviceArea.code)"
                    [ngClass]="getFieldErrorClass(serviceArea, 'code')"
                    class="w-full"
                    [disabled]="!isManualSeries && serviceArea.isNew"
                  />
                  <small *ngIf="getFieldError(serviceArea, 'code')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(serviceArea, 'code') }}</small>
                </div>
              </ng-container>
              <ng-template #codeText>{{ serviceArea.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="serviceArea.isNew || serviceArea.isEditing; else typeText">
                <div class="flex align-items-center gap-2">
                  <p-dropdown
                    [options]="serviceAreaTypes"
                    [(ngModel)]="serviceArea.type"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Select Type"
                    appendTo="body"
                    [filter]="true"
                    filterBy="label"
                    (onChange)="onFieldChange(serviceArea, 'type', $event.value)"
                    [ngClass]="getFieldErrorClass(serviceArea, 'type')"
                    class="w-full"
                  ></p-dropdown>
                  <button pButton type="button" icon="pi pi-ellipsis-h" class="p-button-sm" (click)="openMaster('serviceAreaType')" [loading]="masterDialogLoading['ServiceAreaType']" title="Open Service Area Type Master"></button>
          
                </div>
              </ng-container>
              <ng-template #typeText>{{ serviceArea.type }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="serviceArea.isNew || serviceArea.isEditing; else serviceAreaText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="serviceArea.service_area" (ngModelChange)="onFieldChange(serviceArea, 'service_area', serviceArea.service_area)"
                    [ngClass]="getFieldErrorClass(serviceArea, 'service_area')"
                    class="w-full"
                  />
                  <small *ngIf="getFieldError(serviceArea, 'service_area')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(serviceArea, 'service_area') }}</small>
                </div>
              </ng-container>
              <ng-template #serviceAreaText>{{ serviceArea.service_area }}</ng-template>
            </td>
            <td>
              <ng-container >
                <p-checkbox [(ngModel)]="serviceArea.from_location" [binary]="true" (onChange)="onFieldChange(serviceArea, 'from_location', serviceArea.from_location)" [disabled]="!serviceArea.isNew && !serviceArea.isEditing"></p-checkbox>
              </ng-container>
              <!--<ng-template #fromText>
                <span>{{ serviceArea.from_location ? '✓' : '✗' }}</span>
              </ng-template>-->
            </td>
            <td>
              <ng-container>
                <p-checkbox [(ngModel)]="serviceArea.to_location" [binary]="true" (onChange)="onFieldChange(serviceArea, 'to_location', serviceArea.to_location)" [disabled]="!serviceArea.isNew && !serviceArea.isEditing" ></p-checkbox>
              </ng-container>
              <!--<ng-template #toText>
                <span>{{ serviceArea.to_location ? '✓' : '✗' }}</span>
              </ng-template> -->
            </td>
            <td>
              <ng-container *ngIf="serviceArea.isNew || serviceArea.isEditing; else statusText">
                <p-dropdown
                  [options]="statusOptions"
                  [(ngModel)]="serviceArea.status"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Status"
                  appendTo="body"
                  (onChange)="onFieldChange(serviceArea, 'status', $event.value)"
                  [ngClass]="getFieldErrorClass(serviceArea, 'status')"
                  class="w-full"
                ></p-dropdown>
              </ng-container>
              <ng-template #statusText>
                <span 
                  [ngClass]="{
                    'bg-green-100 text-green-700': serviceArea.status === 'active',
                    'bg-red-100 text-red-700': serviceArea.status === 'inactive'
                  }"
                  class="px-2 py-1 rounded-md text-xs font-medium"
                >
                  {{ serviceArea.status }}
                </span>
              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(serviceArea)"
                  title="Edit"
                  *ngIf="!serviceArea.isEditing && !serviceArea.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm"
                  (click)="saveRow(serviceArea)"
                  title="Save"
                  
                  *ngIf="serviceArea.isEditing || serviceArea.isNew"
                ></button>
                <button
                *ngIf="serviceArea.isNew"
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm"
                  severity="danger"
                  (click)="deleteRow(serviceArea)"
                  title="Delete"
                ></button>
              </div>
            </td>
            </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Service Areas: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
       <!-- Master Type Dialog -->
    <p-dialog
      header="Service Area Type Master"
      [(visible)]="masterDialogVisible['serviceAreaType']"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('serviceAreaType')">
      <master-type [filterByKey]="'SERVICE_AREA'"></master-type>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .p-dropdown {
      width: 100%;
    }
    
    .grid-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .grid-item {
      margin-bottom: 1rem;
    }
    
    .dialog-body-padding {
      padding: 0 1rem;
    }
    
    :host ::ng-deep .p-dialog-content {
      overflow-y: visible;
    }
  `]
})
export class ServiceAreaComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table!: Table;
  
  serviceAreas: any[] = [];
  serviceAreaTypes: any[] = [];
  statusOptions: any[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];
  statusFilterOptions: any[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];
  
  searchTerm: string = '';
  contextSubscription: Subscription | null = null;
  contextId: string = '';
  masterDialogVisible: { [key: string]: boolean } = {};
  masterDialogLoading: { [key: string]: boolean } = {};
  // number series properties
  isManualSeries:boolean = false;
  mappedSvcAreaSeriesCode:string ='';
  
  constructor(
    private serviceAreaService: ServiceAreaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private contextService: ContextService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private masterTypeService: MasterTypeService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
  ) {}

  loadMappedServiceAreaCode(){
    const context = this.contextService.getContext();
    console.log('Loading Source Cargo code for context:', context);
    
    // Use context-based mapping with NumberSeriesRelation
    this.mappingService.findMappingByContext(
      'serviceAreaCode',
      context.companyCode || '',
      context.branchCode || '',
      context.departmentCode || '',
      context.serviceType || undefined
    ).subscribe({
      next: (contextMapping: any) => {
        console.log('source mapping relation response:', contextMapping);
        this.mappedSvcAreaSeriesCode = contextMapping.mapping;
        if (this.mappedSvcAreaSeriesCode) {
          this.numberSeriesService.getAll().subscribe({
            next: (seriesList: any[]) => {
              const found = seriesList.find((s: any) => s.code === this.mappedSvcAreaSeriesCode);
              this.isManualSeries = !!(found && found.is_manual);
              console.log('cargo series code mapped:', this.mappedSvcAreaSeriesCode, 'is Manual:', this.isManualSeries);
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
            this.mappedSvcAreaSeriesCode = mapping.cargoCode || '';
            if (this.mappedSvcAreaSeriesCode) {
              this.numberSeriesService.getAll().subscribe({
                next: (seriesList: any[]) => {
                  const found = seriesList.find((s: any) => s.code === this.mappedSvcAreaSeriesCode);
                  this.isManualSeries = !!(found && found.is_manual);
                  console.log('source series code mapped (fallback):', this.mappedSvcAreaSeriesCode, 'Manual:', this.isManualSeries);
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
    this.loadServiceAreaTypes();
    
    this.contextSubscription = this.contextService.context$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(context => {
        if (context) {
          this.contextId = this.getContextId(context);
          this.loadServiceAreas();
        }
    });
    this.loadMappedServiceAreaCode();
  }
  
  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }
  
  // Helper method to get context identifier
  getContextId(context: any): string {
    // Create a composite key from available context properties
    return `${context.companyCode || ''}-${context.branchCode || ''}-${context.departmentCode || ''}-${context.serviceType || ''}`;
  }
  
  loadServiceAreas() {
    if (!this.contextId) return;
    
    this.serviceAreaService.getServiceAreas().subscribe({
      next: (data) => {
        this.serviceAreas = data.map(item => ({
          ...item,
          isEditing: false,
          isNew: false,
          errors: {}
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load service areas'
        });
        console.error('Error loading service areas:', error);
      }
    });
  }
  
loadServiceAreaTypes() {
  this.masterTypeService.getAll().subscribe({
    next: (types: any[]) => {
      
      this.serviceAreaTypes = types
        .filter(t => t.key === 'SERVICE_AREA' && t.status === 'Active' )
        .map(t => ({
          label: t.value,   // adjust based on actual field names
          value: t.value    // could also use t.id or t.code
        }));
      console.log('DEBUG dropdown options:', this.serviceAreaTypes);
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load service area types'
      });
      console.error('Error loading service area types:', error);
    }
  });
}


  addRow() {
    const newServiceArea = {
      id: 'new_' + new Date().getTime(),
      code: this.isManualSeries ? '':(this.mappedSvcAreaSeriesCode || ''),
      type: '',
      service_area: '',
      from_location: false,
      to_location: false,
      status: 'active',
      isNew: true,
      isEditing: false,
      errors: {}
    };
    
    this.serviceAreas = [newServiceArea, ...this.serviceAreas];
  }
  
  editRow(serviceArea: any) {
    serviceArea.isEditing = true;
    serviceArea._originalData = { ...serviceArea };
    this.cdr.detectChanges();
  }
  
  cancelEdit(serviceArea: any) {
    if (serviceArea.isNew) {
      this.serviceAreas = this.serviceAreas.filter(item => item.id !== serviceArea.id);
    } else {
      Object.assign(serviceArea, serviceArea._originalData);
      serviceArea.isEditing = false;
      delete serviceArea._originalData;
    }
  }
  
  saveRow(serviceArea: any) {
    if (!this.validateServiceArea(serviceArea)) {
      return;
    }
    
    const serviceAreaData = {
      code: serviceArea.code,
      seriesCode: this.mappedSvcAreaSeriesCode,  
      type: serviceArea.type,
      service_area: serviceArea.service_area,
      from_location: serviceArea.from_location,
      to_location: serviceArea.to_location,
      status: serviceArea.status,
      context_id: this.contextId
    };

    if (!this.isManualSeries && serviceArea.isNew) {
      serviceAreaData.code = '';
    }
    
    
    if (serviceArea.isNew) {
      this.serviceAreaService.createServiceArea(serviceAreaData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Service Area created successfully'
          });
          
          // Update the row with the returned data
          const index = this.serviceAreas.findIndex(item => item.id === serviceArea.id);
          if (index !== -1) {
            this.serviceAreas[index] = {
              ...response,
              isNew: false,
              isEditing: false,
              errors: {}
            };
          }
          
          this.loadServiceAreas(); // Refresh the list
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create service area'
          });
          console.error('Error creating service area:', error);
        }
      });
    } else {
      this.serviceAreaService.updateServiceArea(serviceArea.code, serviceAreaData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Service Area updated successfully'
          });
          
          serviceArea.isEditing = false;
          delete serviceArea._originalData;
          delete serviceArea.errors;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update service area'
          });
          console.error('Error updating service area:', error);
        }
      });
    }
  }
  
  confirmDelete(serviceArea: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this service area?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteServiceArea(serviceArea);
      }
    });
  }
  
  deleteServiceArea(serviceArea: any) {
    this.serviceAreaService.deleteServiceArea(serviceArea.code).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Service Area deleted successfully'
        });
        this.serviceAreas = this.serviceAreas.filter(item => item.code !== serviceArea.code);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete service area'
        });
        console.error('Error deleting service area:', error);
      }
    });
  }
  openMaster(key: string) {
    this.masterDialogLoading[key] = true;
    setTimeout(() => {
      this.masterDialogVisible[key] = true;
      this.masterDialogLoading[key] = false;
      this.cdr.detectChanges();
    }, 200);
  }
  closeMasterDialog(key: string) {
    this.masterDialogVisible[key] = false;
    // Refresh dropdown after closing master
    this.loadServiceAreaTypes();
  }
  
  
  validateServiceArea(serviceArea: any): boolean {
    serviceArea.errors = {};
    let isValid = true;
    
    if (!serviceArea.code || serviceArea.code.trim() === '') {
      serviceArea.errors['code'] = 'Code is required';
      isValid = false;
    }
    
    if (!serviceArea.type || serviceArea.type.trim() === '') {
      serviceArea.errors['type'] = 'Type is required';
      isValid = false;
    }
    
    if (!serviceArea.service_area || serviceArea.service_area.trim() === '') {
      serviceArea.errors['service_area'] = 'Service Area is required';
      isValid = false;
    }
    
    return isValid;
  }
  
  getFieldError(serviceArea: any, field: string): string {
    return serviceArea.errors && serviceArea.errors[field] ? serviceArea.errors[field] : '';
  }
  
  getFieldErrorClass(serviceArea: any, field: string): string {
    return this.getFieldError(serviceArea, field) ? 'ng-invalid ng-dirty' : '';
  }
  
  onFieldChange(serviceArea: any, field: string, value: any) {
    if (serviceArea.errors && serviceArea.errors[field]) {
      delete serviceArea.errors[field];
    }
  }
  
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
  
  deleteRow(serviceArea: any) {
    if (serviceArea.id && !serviceArea.isNew) {
      this.serviceAreaService.deleteServiceArea(serviceArea.code).subscribe({
        next: () => {
          this.serviceAreas = this.serviceAreas.filter(m => m !== serviceArea);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Service Area deleted' });
          this.loadServiceAreas();
        },
        error: (err) => {
          console.error('Failed to delete master', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
        }
      });
    } else {
      this.serviceAreas = this.serviceAreas.filter(m => m !== serviceArea);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Service Area deleted' });
      this.loadServiceAreas();
    }
  }
  
  
  clear(table: Table) {
    table.clear();
    this.searchTerm = '';
  }
}