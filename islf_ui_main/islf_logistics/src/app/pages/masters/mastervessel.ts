import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';

import { MasterVesselService, MasterVessel } from '../../services/master-vessel.service';
import { NumberSeriesService } from '@/services/number-series.service';
import { MappingService } from '@/services/mapping.service';
import { MasterLocationService } from '@/services/master-location.service';
import { ConfigService } from '@/services/config.service';
import { ContextService } from '@/services/context.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface FlagOption {
  label: string;
  value: string;
}

@Component({
  selector: 'master-vessel',
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
    CalendarModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Vessel Master</div>
      
      
      <p-table
        #dt
        [value]="vessels"
        dataKey="id"
        [paginator]="true"

        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'vessel_name', 'imo_number', 'flag', 'year_build']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Vessel" icon="pi pi-plus" (click)="addRow()"></button>
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
                Vessel Name
                <p-columnFilter type="text" field="vessel_name" display="menu" placeholder="Search by name"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                IMO Number
                <p-columnFilter type="text" field="imo_number" display="menu" placeholder="Search by IMO"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Flag
                <p-columnFilter type="text" field="flag" display="menu" placeholder="Search by flag"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Year Build
                <p-columnFilter type="text" field="year_build" display="menu" placeholder="Search by year"></p-columnFilter>
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
        <ng-template pTemplate="body" let-vessel>
          <tr>
            <td>{{ vessel.code }}</td>
            <td>{{ vessel.vessel_name }}</td>
            <td>{{ vessel.imo_number }}</td>
            <td>{{ vessel.flag }}</td>
            <td>{{ vessel.year_build }}</td>
            <td>
              <span
                class="text-sm font-semibold px-3 py-1 rounded-full"
                [ngClass]="{
                  'text-green-700 bg-green-100': vessel.active,
                  'text-red-700 bg-red-100': !vessel.active
                }"
              >
                {{ vessel.active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(vessel)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          Total Vessels: {{ state.totalRecords }}
        </ng-template>
      </p-table>
    </div>
    <p-dialog
      header="{{ selectedVessel?.isNew ? 'Add' : 'Edit' }} Vessel"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '600px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedVessel" class="p-fluid form-grid dialog-body-padding">
          <div class="grid-container">
            <div class="grid-item">
              <label for="code">Code</label>
              <input 
                id="code" 
                pInputText 
                [(ngModel)]="selectedVessel.code" 
                [disabled]="!isManualSeries || !selectedVessel.isNew" 
                (ngModelChange)="onFieldChange('code', selectedVessel.code)" 
                [ngClass]="{'ng-invalid ng-dirty': getFieldError('code')}" 
              />
              <small *ngIf="getFieldError('code')" class="p-error">{{getFieldError('code')}}</small>
            </div>
            <div class="grid-item">
              <label for="vessel_name">Vessel Name</label>
              <input 
                id="vessel_name" 
                pInputText 
                [(ngModel)]="selectedVessel.vessel_name" 
                (ngModelChange)="onFieldChange('vessel_name', selectedVessel.vessel_name)" 
                [ngClass]="{'ng-invalid ng-dirty': getFieldError('vessel_name')}" 
              />
              <small *ngIf="getFieldError('vessel_name')" class="p-error">{{getFieldError('vessel_name')}}</small>
            </div>
            <div class="grid-item">
              <label for="imo_number">IMO Number</label>
              <input 
                id="imo_number" 
                pInputText 
                [(ngModel)]="selectedVessel.imo_number" 
                placeholder="Enter IMO number" 
              />
            </div>
            <div class="grid-item">
              <label for="flag">Flag</label>
              <p-dropdown
                id="flag"
                [options]="flagOptions"
                [(ngModel)]="selectedVessel.flag"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Flag"
                [filter]="true"
                (onChange)="onFieldChange('flag', selectedVessel.flag)"
                [ngClass]="{'ng-invalid ng-dirty': getFieldError('flag')}"
              ></p-dropdown>
              <small *ngIf="getFieldError('flag')" class="p-error">{{getFieldError('flag')}}</small>
            </div>
           
            <div class="grid-item">
              <label for="year_build">Year Build</label>
              <p-calendar
                id="year_build"
                [(ngModel)]="selectedVessel.year_build"
                view="year"
                dateFormat="yy"
                [showIcon]="true"
                placeholder="Select Year"
                [yearNavigator]="true"
                yearRange="1900:2030"
                (onSelect)="onFieldChange('year_build', selectedVessel.year_build)"
                [ngClass]="{'ng-invalid ng-dirty': getFieldError('year_build')}"
              ></p-calendar>
              <small *ngIf="getFieldError('year_build')" class="p-error">{{getFieldError('year_build')}}</small>
            </div>
            <div class="grid-item">
              <label for="active">Status</label>
              <p-dropdown
                id="active"
                [options]="activeOptions"
                [(ngModel)]="selectedVessel.active"
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
          <button pButton label="{{ selectedVessel?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()"></button>
        </div>
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
export class MasterVesselComponent implements OnInit, OnDestroy {
  vessels: MasterVessel[] = [];
  flagOptions: FlagOption[] = [];
  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];
  mappedVesselSeriesCode: string | null = null;
  isManualSeries: boolean = false;
  isDialogVisible = false;
  selectedVessel: (MasterVessel & { isNew?: boolean }) | null = null;
  
  // Field validation states
  fieldErrors: { [key: string]: string } = {};
  touchedFields: { [key: string]: boolean } = {};
  private contextSubscription: Subscription | undefined;

  constructor(
    private masterVesselService: MasterVesselService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private masterLocationService: MasterLocationService,
    private messageService: MessageService,
    private configService: ConfigService,
    private contextService: ContextService
  ) {}

  ngOnInit() {
    this.loadFlagOptions();
    this.reloadData(); // Use the optimized reload method
    
    // Subscribe to context changes and reload data when context changes
    this.contextSubscription = this.contextService.context$.pipe(
      debounceTime(300), // Wait 300ms after the last context change
      distinctUntilChanged() // Only emit when context actually changes
    ).subscribe(() => {
      console.log('Context changed in MasterVesselComponent, reloading data...');
      this.reloadData();
    });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  loadFlagOptions() {
    this.masterLocationService.getAll().subscribe(locations => {
      // Extract unique countries from locations
      const countries = [...new Set(locations.map(loc => loc.country).filter(country => country))];
      
      // Convert to flag options format
      this.flagOptions = countries.map(country => ({
        label: country,
        value: country
      })).sort((a, b) => a.label.localeCompare(b.label));
    });
  }

  loadMappedVesselSeriesCode(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get current context for context-based mapping
      const context = this.contextService.getContext();
      
      // Try context-based mapping first
      this.mappingService.findMappingByContext(
        'vesselCode',
        context.companyCode || '',
        context.branchCode || '',
        context.departmentCode || '',
        context.serviceType || ''
      ).subscribe({
        next: (contextMapping) => {
          if (contextMapping && contextMapping.mapping) {
            this.mappedVesselSeriesCode = contextMapping.mapping;
            console.log('Context-based vessel series code mapped:', this.mappedVesselSeriesCode);
            this.checkSeriesManualFlag(resolve, reject);
          } else {
            // Fallback to generic mapping if context-based mapping fails
            console.log('No context-based vessel mapping found, falling back to generic mapping');
            this.mappingService.getMapping().subscribe({
              next: (mapping) => {
                this.mappedVesselSeriesCode = mapping.vesselCode;
                if (this.mappedVesselSeriesCode) {
                  console.log('Generic vessel series code mapped:', this.mappedVesselSeriesCode);
                  this.checkSeriesManualFlag(resolve, reject);
                } else {
                  this.isManualSeries = false;
                  console.log('No vessel series code mapped');
                  resolve();
                }
              },
              error: (error) => {
                console.error('Error loading generic mapping:', error);
                reject(error);
              }
            });
          }
        },
        error: (error) => {
          console.error('Error loading context-based mapping, falling back to generic mapping:', error);
          // Fallback to generic mapping if context-based mapping fails
          this.mappingService.getMapping().subscribe({
            next: (mapping) => {
              this.mappedVesselSeriesCode = mapping.vesselCode;
              if (this.mappedVesselSeriesCode) {
                console.log('Generic vessel series code mapped:', this.mappedVesselSeriesCode);
                this.checkSeriesManualFlag(resolve, reject);
              } else {
                this.isManualSeries = false;
                console.log('No vessel series code mapped');
                resolve();
              }
            },
            error: (error) => {
              console.error('Error loading generic mapping:', error);
              reject(error);
            }
          });
        }
      });
    });
  }

  private checkSeriesManualFlag(resolve: () => void, reject: (error: any) => void): void {
    this.numberSeriesService.getAll().subscribe({
      next: (seriesList) => {
        const found = seriesList.find((s: any) => s.code === this.mappedVesselSeriesCode);
        this.isManualSeries = !!(found && found.is_manual);
        console.log('Vessel series code mapped:', this.mappedVesselSeriesCode, 'Manual:', this.isManualSeries);
        resolve();
      },
      error: (error) => {
        console.error('Error loading number series:', error);
        reject(error);
      }
    });
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  reloadData() {
    console.log('Starting data reload...');
    
    // Load both vessel data and mapping in parallel
    Promise.all([
      this.refreshList(),
      this.loadMappedVesselSeriesCode()
    ]).finally(() => {
      console.log('Data reload completed');
    });
  }

  refreshList(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get the Validation settings
      const config = this.configService.getConfig();
      const vesselFilter = config?.validation?.vesselFilter || '';
      
      // Determine if we should filter by context based on validation settings
      const filterByContext = !!vesselFilter;
      
      this.masterVesselService.getAll(filterByContext).subscribe({
        next: (data) => {
          this.vessels = data;
          console.log(`Loaded ${data.length} vessels`);
          resolve();
        },
        error: (err) => {
          console.error('Failed to load vessels:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load vessels' });
          reject(err);
        }
      });
    });
  }

  addRow() {
    console.log('Add Vessel button clicked - starting addRow method');
    
    // Get the Validation settings
    const config = this.configService.getConfig();
    const vesselFilter = config?.validation?.vesselFilter || '';
    
    console.log('Vessel filter:', vesselFilter);
    
    // Check if we need to validate context
    if (vesselFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      let contextValid = true;
      let missingContexts = [];
      
      if (vesselFilter.includes('C') && !context.companyCode) {
        contextValid = false;
        missingContexts.push('Company');
      }
      
      if (vesselFilter.includes('B') && !context.branchCode) {
        contextValid = false;
        missingContexts.push('Branch');
      }
      
      if (vesselFilter.includes('D') && !context.departmentCode) {
        contextValid = false;
        missingContexts.push('Department');
      }
      
      if (vesselFilter.includes('ST') && !context.serviceType) {
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
          detail: `Please select ${missingContexts.join(', ')} in the context selector before adding a vessel.`
        });
        
        // Trigger the context selector
        this.contextService.showContextSelector();
        return;
      }
    }
    
    // Reset validation state
    this.fieldErrors = {};
    this.touchedFields = {};
    
    // Load mapping to determine if series is manual before showing dialog
    this.loadMappedVesselSeriesCode().then(() => {
      this.selectedVessel = {
        code: '', // Will be filled after creation or entered if manual
        vessel_name: '',
        imo_number: '',
        flag: '',
        year_build: '',
        active: true,
        isNew: true
      };
      this.isDialogVisible = true;
    }).catch((error) => {
      console.error('Error loading vessel mapping:', error);
      // Still show dialog even if mapping fails
      this.selectedVessel = {
        code: '',
        vessel_name: '',
        imo_number: '',
        flag: '',
        year_build: '',
        active: true,
        isNew: true
      };
      this.isDialogVisible = true;
    });
  }

  editRow(vessel: MasterVessel) {
    this.selectedVessel = { ...vessel, isNew: false };
    this.isDialogVisible = true;
  }

  // Validation methods
  validateField(field: string, value: any): string {
    switch (field) {
      case 'code':
        if (this.isManualSeries && (!value || (typeof value === 'string' && value.trim() === ''))) return 'Code is required';
        break;
      case 'vessel_name':
        if (!value || (typeof value === 'string' && value.trim() === '')) return 'Vessel Name is required';
        break;
      case 'flag':
        if (!value || (typeof value === 'string' && value.trim() === '')) return 'Flag is required';
        break;
      case 'year_build':
        if (!value) return 'Year Build is required';
        break;
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
    this.touchedFields[field] = true;
  }

  getFieldError(field: string): string {
    return this.touchedFields[field] ? this.fieldErrors[field] || '' : '';
  }

  validateForm(): boolean {
    if (!this.selectedVessel) return false;
    
    // For code, only require it if it's a manual series
    const requiredFields = this.isManualSeries ?
      ['code', 'vessel_name', 'flag', 'year_build'] :
      ['vessel_name', 'flag', 'year_build'];
      
    for (const field of requiredFields) {
      const error = this.validateField(field, this.selectedVessel[field as keyof MasterVessel]);
      if (error) {
        this.fieldErrors[field] = error;
        // Mark all fields as touched when form validation runs
        this.touchedFields[field] = true;
      }
    }
    
    return Object.keys(this.fieldErrors).length === 0;
  }

  saveRow() {
    if (!this.selectedVessel) return;
    
    // Validate the form
    if (!this.validateForm()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly.'
      });
      return;
    }
    
    if (this.selectedVessel.isNew && this.vessels.some(v => v.code === this.selectedVessel?.code)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Duplicate Code',
        detail: 'Vessel with the same code already exists.'
      });
      return;
    }
    
    // Get the current context for relation mapping
    const context = this.contextService.getContext();
    
    const payload: any = {
      vessel_name: this.selectedVessel.vessel_name,
      imo_number: this.selectedVessel.imo_number,
      flag: this.selectedVessel.flag,
      year_build: this.selectedVessel.year_build,
      active: this.selectedVessel.active,
      seriesCode: this.mappedVesselSeriesCode, // Always use mapped code
      companyCode: context.companyCode,
      branchCode: context.branchCode,
      departmentCode: context.departmentCode,
      ServiceTypeCode: context.serviceType
    };
    
    if (this.selectedVessel.code) {
      payload.code = this.selectedVessel.code; // For manual series
    }
    
    const req = this.selectedVessel.isNew
      ? this.masterVesselService.create(payload)
      : this.masterVesselService.update(this.selectedVessel.id!, payload);
      
    req.subscribe({
      next: (createdVessel) => {
        const msg = this.selectedVessel?.isNew ? 'Vessel created' : 'Vessel updated';
        this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
        this.refreshList();
        this.hideDialog();
      },
      error: (err) => {
        console.error('Operation failed:', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: err.error?.error || 'Operation failed' 
        });
      }
    });
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedVessel = null;
    this.fieldErrors = {};
    this.touchedFields = {};
  }

  clear(table: any) {
    table.clear();
  }
}
