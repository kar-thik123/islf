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
import { SourceSalesService } from '@/services/source-sales.service';
import { ContextService } from '@/services/context.service';
import { ConfigService } from '@/services/config.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';
import { MappingService } from '@/services/mapping.service'
import { NumberSeriesService } from '@/services/number-series.service';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-source-sales',
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
    DialogModule,
    InputNumberModule
  ],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Source Sales</div>
      <p-table
        #dt
        [value]="sourceSales"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'name', 'commission', 'email', 'phone', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Source Sales" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <span class="ml-auto">
              <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
            </span>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Commission %</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-sourceSale>
          <tr>
            <td>
              <ng-container *ngIf="sourceSale.isNew || sourceSale.isEditing; else codeText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="sourceSale.code" (ngModelChange)="onFieldChange(sourceSale, 'code', sourceSale.code)"
                    [ngClass]="getFieldErrorClass(sourceSale, 'code')"
                    [disabled]="!isManualSeries"
                    class="w-full"
                  />
                  <small *ngIf="getFieldError(sourceSale, 'code')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(sourceSale, 'code') }}</small>
                </div>
              </ng-container>
              <ng-template #codeText>{{ sourceSale.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="sourceSale.isNew || sourceSale.isEditing; else nameText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="sourceSale.name" (ngModelChange)="onFieldChange(sourceSale, 'name', sourceSale.name)"
                    [ngClass]="getFieldErrorClass(sourceSale, 'name')"
                    class="w-full"
                  />
                  <small *ngIf="getFieldError(sourceSale, 'name')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(sourceSale, 'name') }}</small>
                </div>
              </ng-container>
              <ng-template #nameText>{{ sourceSale.name }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="sourceSale.isNew || sourceSale.isEditing; else commissionText">
                <div class="flex flex-col">
                  <p-inputNumber [(ngModel)]="sourceSale.commission_percentage" (onInput)="onFieldChange(sourceSale, 'commission_percentage', sourceSale.commission_percentage)"
                    [ngClass]="getFieldErrorClass(sourceSale, 'commission_percentage')"
                    [min]="0"
                    [max]="100"
                    [minFractionDigits]="2"
                    [maxFractionDigits]="2"
                    suffix="%"
                    class="w-full"
                  ></p-inputNumber>
                  <small *ngIf="getFieldError(sourceSale, 'commission_percentage')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(sourceSale, 'commission_percentage') }}</small>
                </div>
              </ng-container>
              <ng-template #commissionText>{{ sourceSale.commission_percentage }}%</ng-template>
            </td>
            <td>
              <ng-container *ngIf="sourceSale.isNew || sourceSale.isEditing; else emailText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="sourceSale.email" (ngModelChange)="onFieldChange(sourceSale, 'email', sourceSale.email)"
                    [ngClass]="getFieldErrorClass(sourceSale, 'email')"
                    class="w-full"
                  />
                  <small *ngIf="getFieldError(sourceSale, 'email')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(sourceSale, 'email') }}</small>
                </div>
              </ng-container>
              <ng-template #emailText>{{ sourceSale.email }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="sourceSale.isNew || sourceSale.isEditing; else phoneText">
                <div class="flex flex-col">
                  <input pInputText [(ngModel)]="sourceSale.phone" (ngModelChange)="onFieldChange(sourceSale, 'phone', sourceSale.phone)"
                    [ngClass]="getFieldErrorClass(sourceSale, 'phone')"
                    class="w-full"
                  />
                  <small *ngIf="getFieldError(sourceSale, 'phone')" class="p-error text-red-500 text-xs ml-2">{{ getFieldError(sourceSale, 'phone') }}</small>
                </div>
              </ng-container>
              <ng-template #phoneText>{{ sourceSale.phone }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="sourceSale.isNew || sourceSale.isEditing; else statusText">
                <p-dropdown
                  [options]="statusOptions"
                  [(ngModel)]="sourceSale.status"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Status"
                  appendTo="body"
                  (onChange)="onFieldChange(sourceSale, 'status', $event.value)"
                  [ngClass]="getFieldErrorClass(sourceSale, 'status')"
                  class="w-full"
                ></p-dropdown>
              </ng-container>
              <ng-template #statusText>
                <span 
                  [ngClass]="{
                    'bg-green-100 text-green-700': sourceSale.status === 'active',
                    'bg-red-100 text-red-700': sourceSale.status === 'inactive'
                  }"
                  class="px-2 py-1 rounded-md text-xs font-medium"
                >
                  {{ sourceSale.status }}
                </span>
              </ng-template>
            </td>
            <td>
              <div class="flex items-center space-x-[8px]">
                <button
                  pButton
                  icon="pi pi-pencil"
                  class="p-button-sm"
                  (click)="editRow(sourceSale)"
                  title="Edit"
                  *ngIf="!sourceSale.isEditing && !sourceSale.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-check"
                  class="p-button-sm p-button-success"
                  (click)="saveRow(sourceSale)"
                  title="Save"
                  *ngIf="sourceSale.isEditing || sourceSale.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-times"
                  class="p-button-sm p-button-danger"
                  (click)="cancelEdit(sourceSale)"
                  title="Cancel"
                  *ngIf="sourceSale.isEditing || sourceSale.isNew"
                ></button>
                <button
                  pButton
                  icon="pi pi-trash"
                  class="p-button-sm p-button-danger"
                  (click)="confirmDelete(sourceSale)"
                  title="Delete"
                  *ngIf="!sourceSale.isEditing && !sourceSale.isNew"
                ></button>
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="7" class="text-center p-4">No source sales found.</td>
          </tr>
        </ng-template>
      </p-table>
    </div>
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
export class SourceSalesComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table!: Table;
  
  sourceSales: any[] = [];
  statusOptions: any[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ];
  
  searchTerm: string = '';
  contextSubscription: Subscription | null = null;
  contextId: string = '';
  
  // number series properties
  isManualSeries: boolean = false;
  mappedSourceSalesSeriesCode: string = '';

  constructor(
    private sourceSalesService: SourceSalesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private contextService: ContextService,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
  ) {}

  ngOnInit() {
    this.contextSubscription = this.contextService.context$
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(context => {
        if (context) {
          this.contextId = this.getContextId(context);
          this.loadSourceSales();
        }
    });
    this.loadMappedSourceSalesCode();
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  getContextId(context: any): string {
    const parts = [];
    if (context.companyCode) parts.push(context.companyCode);
    if (context.branchCode) parts.push(context.branchCode);
    if (context.departmentCode) parts.push(context.departmentCode);
    if (context.serviceType) parts.push(context.serviceType);
    return parts.join('_');
  }

  loadMappedSourceSalesCode() {
    const context = this.contextService.getContext();
    console.log('Loading Source Sales code for context:', context);
    
    // Use context-based mapping with NumberSeriesRelation
    this.mappingService.findMappingByContext(
      'salesSourcePersonCode',
      context.companyCode || '',
      context.branchCode || '',
      context.departmentCode || '',
      context.serviceType || undefined
    ).subscribe({
      next: (contextMapping: any) => {
        console.log('source mapping relation response:', contextMapping);
        this.mappedSourceSalesSeriesCode = contextMapping.mapping;
        if (this.mappedSourceSalesSeriesCode) {
          this.numberSeriesService.getAll().subscribe({
            next: (seriesList: any[]) => {
              const found = seriesList.find((s: any) => s.code === this.mappedSourceSalesSeriesCode);
              this.isManualSeries = !!(found && found.is_manual);
              console.log('source sales series code mapped:', this.mappedSourceSalesSeriesCode, 'is Manual:', this.isManualSeries);
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
        console.error('Error loading source sales series mapping:', error);
        this.isManualSeries = true;
      }
    });
  }

  loadSourceSales() {
    if (!this.contextId) return;
    
    this.sourceSalesService.getSourceSales().subscribe({
      next: (data) => {
        this.sourceSales = data.map(item => ({
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
          detail: 'Failed to load source sales'
        });
        console.error('Error loading source sales:', error);
      }
    });
  }

  addRow() {
    const newSourceSale = {
      id: 'new_' + new Date().getTime(),
      code: this.isManualSeries ? '' : (this.mappedSourceSalesSeriesCode || ''),
      name: '',
      commission_percentage: 0,
      email: '',
      phone: '',
      status: 'active',
      isNew: true,
      isEditing: true,
      errors: {}
    };
    
    this.sourceSales = [newSourceSale, ...this.sourceSales];
  }

  editRow(sourceSale: any) {
    sourceSale.isEditing = true;
    sourceSale._originalData = { ...sourceSale };
    this.cdr.detectChanges();
  }
  
  cancelEdit(sourceSale: any) {
    if (sourceSale.isNew) {
      this.sourceSales = this.sourceSales.filter(item => item.id !== sourceSale.id);
    } else {
      Object.assign(sourceSale, sourceSale._originalData);
      sourceSale.isEditing = false;
      delete sourceSale._originalData;
    }
  }

  saveRow(sourceSale: any) {
    if (!this.validateSourceSale(sourceSale)) {
      return;
    }
    
    const sourceSaleData = {
      code: sourceSale.code,
      seriesCode: this.mappedSourceSalesSeriesCode,  
      name: sourceSale.name,
      commission_percentage: sourceSale.commission_percentage,
      email: sourceSale.email,
      phone: sourceSale.phone,
      status: sourceSale.status,
      context_id: this.contextId
    };

    if (!this.isManualSeries && sourceSale.isNew) {
      sourceSaleData.code = '';
      sourceSaleData.seriesCode = this.mappedSourceSalesSeriesCode;
    }
    
    if (sourceSale.isNew) {
      this.sourceSalesService.createSourceSales(sourceSaleData).subscribe({
        next: (response: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Source Sales created successfully'
          });
          
          // Update the row with the returned data
          const index = this.sourceSales.findIndex(item => item.id === sourceSale.id);
          if (index !== -1) {
            this.sourceSales[index] = {
              ...response,
              isNew: false,
              isEditing: false,
              errors: {}
            };
          }
          
          this.loadSourceSales(); // Refresh the list
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create source sales'
          });
          console.error('Error creating source sales:', error);
        }
      });
    } else {
      this.sourceSalesService.updateSourceSales(sourceSale.id, sourceSaleData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Source Sales updated successfully'
          });
          
          sourceSale.isEditing = false;
          delete sourceSale._originalData;
          delete sourceSale.errors;
        },
        error: (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update source sales'
          });
          console.error('Error updating source sales:', error);
        }
      });
    }
  }

  validateSourceSale(sourceSale: any): boolean {
    const errors: any = {};
    
    if (!sourceSale.code && this.isManualSeries) {
      errors.code = 'Code is required';
    }
    
    if (!sourceSale.name) {
      errors.name = 'Name is required';
    }
    
    if (sourceSale.commission_percentage === null || sourceSale.commission_percentage === undefined) {
      errors.commission_percentage = 'Commission is required';
    } else if (sourceSale.commission_percentage < 0 || sourceSale.commission_percentage > 100) {
      errors.commission_percentage = 'Commission must be between 0 and 100';
    }
    
    if (!sourceSale.email) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(sourceSale.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!sourceSale.phone) {
      errors.phone = 'Phone number is required';
    }
    
    if (!sourceSale.status) {
      errors.status = 'Status is required';
    }
    
    sourceSale.errors = errors;
    return Object.keys(errors).length === 0;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  confirmDelete(sourceSale: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this source sales record?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteSourceSale(sourceSale);
      }
    });
  }

  deleteSourceSale(sourceSale: any) {
    this.sourceSalesService.deleteSourceSales(sourceSale.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Source Sales deleted successfully'
        });
        this.sourceSales = this.sourceSales.filter(item => item.id !== sourceSale.id);
      },
      error: (error: any) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete source sales'
        });
        console.error('Error deleting source sales:', error);
      }
    });
  }

  getFieldError(sourceSale: any, field: string): string {
    return sourceSale.errors && sourceSale.errors[field] ? sourceSale.errors[field] : '';
  }
  
  getFieldErrorClass(sourceSale: any, field: string): string {
    return sourceSale.errors && sourceSale.errors[field] ? 'ng-invalid ng-dirty' : '';
  }

  onFieldChange(sourceSale: any, field: string, value: any) {
    if (sourceSale.errors && sourceSale.errors[field]) {
      delete sourceSale.errors[field];
    }
  }
  
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
    this.searchTerm = '';
  }
}