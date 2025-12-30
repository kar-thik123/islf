import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MasterAirlineService, MasterAirline } from '../../services/master-airline.service';
import { NumberSeriesService } from '@/services/number-series.service';
import { MappingService } from '@/services/mapping.service';
import { ConfigService } from '@/services/config.service';
import { ContextService } from '@/services/context.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface ExtendedMasterAirline extends MasterAirline {
  isEditing?: boolean;
  isNew?: boolean;
  originalData?: any;
  status?: string;
}

@Component({
  selector: 'master-airline',
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
      <div class="font-semibold text-xl mb-4">Airline Master</div>
      
      <p-table
        #dt
        [value]="airlines"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'airline_name', 'airline_no', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Airline" icon="pi pi-plus" (click)="addRow()"></button>
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
                Code
                <p-columnFilter type="text" field="code" display="menu" placeholder="Search by code"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Airline Name
                <p-columnFilter type="text" field="airline_name" display="menu" placeholder="Search by name"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Airline No.
                <p-columnFilter type="text" field="airline_no" display="menu" placeholder="Search by number"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Status
                <p-columnFilter field="status" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="filterStatusOptions"
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
            <th style="min-width: 120px;">Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-airline>
          <tr>
            <td>
              <ng-container *ngIf="airline.isNew && isManualSeries; else codeText">
                  <div class="flex flex-col">
                    <input pInputText [(ngModel)]="airline.code" (ngModelChange)="onFieldChange(airline, 'code', airline.code)" [ngClass]="{'ng-invalid ng-dirty': getFieldError(airline, 'code')}" />
                    <small *ngIf="getFieldError(airline, 'code')" class="p-error">{{getFieldError(airline, 'code')}}</small>
                  </div>
              </ng-container>
              <ng-template #codeText>{{ airline.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="airline.isEditing || airline.isNew; else nameText">
                  <div class="flex flex-col">
                    <input pInputText [(ngModel)]="airline.airline_name" (ngModelChange)="onFieldChange(airline, 'airline_name', airline.airline_name)" [ngClass]="{'ng-invalid ng-dirty': getFieldError(airline, 'airline_name')}" />
                    <small *ngIf="getFieldError(airline, 'airline_name')" class="p-error">{{getFieldError(airline, 'airline_name')}}</small>
                  </div>
              </ng-container>
              <ng-template #nameText>{{ airline.airline_name }}</ng-template>
            </td>
            <td>
                <ng-container *ngIf="airline.isEditing || airline.isNew; else noText">
                   <input pInputText [(ngModel)]="airline.airline_no" />
               </ng-container>
               <ng-template #noText>{{ airline.airline_no }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="airline.isEditing || airline.isNew; else statusText">
                <p-dropdown [options]="activeOptions" [(ngModel)]="airline.active" optionLabel="label" optionValue="value" appendTo="body"></p-dropdown>
              </ng-container>
              <ng-template #statusText>
                <span
                  class="text-sm font-semibold px-3 py-1 rounded-full"
                  [ngClass]="{
                    'text-green-700 bg-green-100': airline.active,
                    'text-red-700 bg-red-100': !airline.active
                  }"
                >
                  {{ airline.status }}
                </span>
              </ng-template>
            </td>
            <td>
              <div class="flex gap-2">
                <button *ngIf="!airline.isEditing && !airline.isNew" pButton icon="pi pi-pencil" (click)="editRow(airline)" class="p-button-sm" title="Edit"></button>
                <button *ngIf="airline.isEditing || airline.isNew" pButton icon="pi pi-check" (click)="saveRow(airline)" class="p-button-sm" title="Save"></button>
                <button *ngIf="airline.isEditing && !airline.isNew" pButton icon="pi pi-times" (click)="cancelEdit(airline)" class="p-button-sm p-button-secondary" title="Cancel"></button>
                <button *ngIf="airline.isNew" pButton icon="pi pi-trash" (click)="deleteRow(airline)" class="p-button-sm p-button-danger" title="Delete"></button>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `
})
export class MasterAirlineComponent implements OnInit, OnDestroy {
  airlines: ExtendedMasterAirline[] = [];

  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  filterStatusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  private contextSubscription: Subscription | undefined;
  mappedAirlineSeriesCode: string | null = null;
  isManualSeries: boolean = false;

  // Field validation states
  fieldErrors: { [key: string]: { [fieldName: string]: string } } = {};

  constructor(
    private masterAirlineService: MasterAirlineService,
    private contextService: ContextService,
    private messageService: MessageService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private configService: ConfigService
  ) { }

  ngOnInit() {
    this.refreshList();
    this.contextSubscription = this.contextService.context$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => { this.refreshList(); });
  }

  ngOnDestroy() {
    if (this.contextSubscription) this.contextSubscription.unsubscribe();
  }

  refreshList() {
    this.masterAirlineService.getAll().subscribe({
      next: (data) => {
        this.airlines = data.map(airline => ({
          ...airline,
          status: airline.active ? 'Active' : 'Inactive',
          isEditing: false,
          isNew: false
        }));
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load airlines' })
    });
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  addRow() {
    const config = this.configService.getConfig();
    const airlineFilter = (config?.validation as any)?.airlineFilter || '';
    const ctx = this.contextService.getContext();
    if (airlineFilter) {
      const missing = [] as string[];
      if (airlineFilter.includes('C') && !ctx.companyCode) missing.push('Company');
      if (airlineFilter.includes('B') && !ctx.branchCode) missing.push('Branch');
      if (airlineFilter.includes('D') && !ctx.departmentCode) missing.push('Department');
      if (airlineFilter.includes('ST') && !ctx.serviceType) missing.push('Service Type');
      if (missing.length) { this.contextService.showContextSelector(); return; }
    }

    this.loadMappedAirlineSeriesCode().then(() => {
      const newAirline: ExtendedMasterAirline = {
        code: '',
        airline_name: '',
        airline_no: '',
        active: true, // Default to true (Active)
        status: 'Active',
        isNew: true,
        isEditing: false // Actually it IS editing implicitly if it's new, but template uses isEditing || isNew
      };
      this.airlines = [newAirline, ...this.airlines];
    }).catch(() => {
      const newAirline: ExtendedMasterAirline = {
        code: '',
        airline_name: '',
        airline_no: '',
        active: true,
        status: 'Active',
        isNew: true
      };
      this.airlines = [newAirline, ...this.airlines];
    });
  }

  editRow(airline: ExtendedMasterAirline) {
    airline.isEditing = true;
    airline.originalData = { ...airline };
  }

  cancelEdit(airline: ExtendedMasterAirline) {
    if (airline.originalData) {
      Object.assign(airline, airline.originalData);
      delete airline.originalData;
    }
    airline.isEditing = false;
    // Re-map status string because originalData might have it or not, safe to re-compute or it was copied
    airline.status = airline.active ? 'Active' : 'Inactive';
  }

  deleteRow(airline: ExtendedMasterAirline) {
    if (airline.isNew) {
      this.airlines = this.airlines.filter(a => a !== airline);
    }
  }

  // Validation
  onFieldChange(airline: ExtendedMasterAirline, field: string, value: any) {
    this.validateField(airline, field, value);
  }

  validateField(airline: ExtendedMasterAirline, field: string, value: any) {
    const key = airline.code || 'new'; // Simplistic key generation
    if (!this.fieldErrors[key]) this.fieldErrors[key] = {};

    delete this.fieldErrors[key][field];

    switch (field) {
      case 'code':
        if (this.isManualSeries && airline.isNew && (!value || !value.trim())) {
          this.fieldErrors[key][field] = 'Code is required';
        }
        break;
      case 'airline_name':
        if (!value || !value.trim()) {
          this.fieldErrors[key][field] = 'Name is required';
        }
        break;
    }
  }

  getFieldError(airline: ExtendedMasterAirline, field: string): string {
    const key = airline.code || 'new';
    return this.fieldErrors[key] ? this.fieldErrors[key][field] : '';
  }

  saveRow(airline: ExtendedMasterAirline) {
    // Trigger validation
    this.validateField(airline, 'airline_name', airline.airline_name);
    if (this.isManualSeries && airline.isNew) {
      this.validateField(airline, 'code', airline.code);
    }

    // Check errors
    const key = airline.code || 'new';
    if (this.fieldErrors[key] && Object.keys(this.fieldErrors[key]).length > 0) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please fix validation errors' });
      return;
    }

    const ctx = this.contextService.getContext();
    const payload: any = {
      airline_name: airline.airline_name,
      airline_no: airline.airline_no,
      active: airline.active,
      seriesCode: airline.isNew ? this.mappedAirlineSeriesCode : undefined, // Only send series code on creation if needed? usually backend handles
      company_code: ctx.companyCode,
      branch_code: ctx.branchCode,
      department_code: ctx.departmentCode,
      Service_type_code: ctx.serviceType
    };

    // Adjust payload for Series Code usage
    if (airline.isNew) {
      payload.seriesCode = this.mappedAirlineSeriesCode;
      if (this.isManualSeries && airline.code) {
        payload.code = airline.code;
      }
    }

    const req = airline.isNew
      ? this.masterAirlineService.create(payload)
      : this.masterAirlineService.update(airline.id!, payload);

    req.subscribe({
      next: (saved: MasterAirline) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Airline saved' });
        // Update local object
        Object.assign(airline, saved);
        airline.status = airline.active ? 'Active' : 'Inactive';
        airline.isNew = false;
        airline.isEditing = false;
        delete airline.originalData;
        // Optional: reduce full refresh to just updating logic, but refreshList is safer
        // this.refreshList(); 
      },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Failed to save' })
    });
  }

  clear(table: any) {
    table.clear();
  }

  private loadMappedAirlineSeriesCode(): Promise<void> {
    return new Promise((resolve, reject) => {
      const ctx = this.contextService.getContext();
      this.mappingService.findMappingByContext(
        'AIRLINE_MASTER',
        ctx.companyCode || '',
        ctx.branchCode || '',
        ctx.departmentCode || '',
        ctx.serviceType || ''
      ).subscribe({
        next: (map) => {
          this.mappedAirlineSeriesCode = map?.mapping || null;
          this.numberSeriesService.getAll().subscribe({
            next: (list) => {
              const found = list.find((s: any) => s.code === this.mappedAirlineSeriesCode);
              this.isManualSeries = !!(found && found.is_manual);
              resolve();
            },
            error: (e) => { this.isManualSeries = false; reject(e); }
          });
        },
        error: (e) => { this.mappedAirlineSeriesCode = null; this.isManualSeries = false; resolve(); }
      });
    });
  }
}
