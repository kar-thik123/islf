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
import { MasterCodeService } from '../../services/mastercode.service';
import { MasterTypeService } from '../../services/mastertype.service';
import { MasterLocationService } from '../../services/master-location.service';
import { TariffService, Tariff } from '../../services/tariff.service';
import { MasterUOMService, MasterUOM } from '../../services/master-uom.service';
import { ContainerCodeService } from '@/services/containercode.service';
import { MasterItemService } from '@/services/master-item.service';
import { CurrencyCodeService } from '@/services/currencycode.service';
import { forkJoin, Subscription } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomerService } from '@/services/customer.service';
import { VendorService } from '@/services/vendor.service';
import { ContextService } from '../../services/context.service';
import { CurrencyCodeComponent } from './currencycode';
import { ContainerCodeComponent } from './containercode';
import { CustomerComponent } from './customer';
import { VendorComponent } from './vendor';
import { MasterUOMComponent } from './masteruom';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-tariff',
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
    CurrencyCodeComponent,
    ContainerCodeComponent,
    CustomerComponent,
    VendorComponent,
    MasterUOMComponent
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Tariff Master</div>

      <p-table
        #dt
        [value]="tariffs"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code','partyType', 'mode', 'shippingType', 'cargoType','unitOfMeasure', 'tariffType', 'itemName']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Create Tariff" icon="pi pi-plus" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <span class="ml-auto">
              <input pInputText type="text" (input)="onGlobalFilter($event, dt)" placeholder="Search keyword" />
            </span>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>Code</th>
            <th>Party Type</th>
            <th>Mode</th>
            <th>Shipping Type</th>
            <th>Cargo Type</th>
            <th>Tariff Type</th>
            <th>Unit Of Measure</th>
            <th>Item Name</th>
            <th>Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-tariff>
          <tr>
            <td>{{ tariff.code }}</td>
            <td>{{ tariff.partyType }}</td>
            <td>{{ tariff.mode }}</td>
            <td>{{ tariff.shippingType }}</td>
            <td>{{ tariff.cargoType }}</td>
            <td>{{ tariff.tariffType }}</td>
            <td>{{ tariff.basis }}</td>
            <td>{{ tariff.itemName }}</td>
            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(tariff)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          Total Tariffs: {{ state.totalRecords }}
        </ng-template>
      </p-table>
    </div>
    
    <p-dialog
      header="{{ selectedTariff?.isNew ? 'Add' : 'Edit' }} Tariff"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '1500px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedTariff" class="p-fluid form-grid dialog-body-padding">
          <div class="grid-container" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem;">
            <div class="grid-item">
              <label>Code <span class="text-red-500">*</span></label>
              <input pInputText [(ngModel)]="selectedTariff.code" (ngModelChange)="onFieldChange('code', selectedTariff.code)" [ngClass]="getFieldErrorClass('code')" [ngStyle]="getFieldErrorStyle('code')"/>
              <small *ngIf="fieldErrors['code']" class="p-error">{{ fieldErrors['code'] }}</small>
            </div>
            <div class="grid-item">
              <label>Mode <span class="text-red-500">*</span></label>
              <p-dropdown [options]="modeOptions" [(ngModel)]="selectedTariff.mode" (ngModelChange)="onFieldChange('mode', selectedTariff.mode)" [ngClass]="getFieldErrorClass('mode')" [ngStyle]="getFieldErrorStyle('mode')" placeholder="Select Mode"></p-dropdown>
              <small *ngIf="fieldErrors['mode']" class="p-error">{{ fieldErrors['mode'] }}</small>
            </div>
            <div class="grid-item">
              <label>Shipping Type</label>
              <p-dropdown [options]="shippingTypeOptions" [(ngModel)]="selectedTariff.shippingType" (ngModelChange)="onFieldChange('shippingType', selectedTariff.shippingType)" [ngClass]="getFieldErrorClass('shippingType')" [ngStyle]="getFieldErrorStyle('shippingType')" placeholder="Select Shipping Type"></p-dropdown>
              <small *ngIf="fieldErrors['shippingType']" class="p-error">{{ fieldErrors['shippingType'] }}</small>
            </div>
            <div class="grid-item">
              <label>Cargo Type</label>
              <p-dropdown [options]="cargoTypeOptions" [(ngModel)]="selectedTariff.cargoType" (ngModelChange)="onFieldChange('cargoType', selectedTariff.cargoType)" [ngClass]="getFieldErrorClass('cargoType')" [ngStyle]="getFieldErrorStyle('cargoType')" placeholder="Select Cargo Type"></p-dropdown>
              <small *ngIf="fieldErrors['cargoType']" class="p-error">{{ fieldErrors['cargoType'] }}</small>
            </div>
            <div class="grid-item">
              <label>Tariff Type</label>
              <p-dropdown [options]="tariffTypeOptions" [(ngModel)]="selectedTariff.tariffType" (ngModelChange)="onFieldChange('tariffType', selectedTariff.tariffType)" [ngClass]="getFieldErrorClass('tariffType')" [ngStyle]="getFieldErrorStyle('tariffType')" placeholder="Select Tariff Type"></p-dropdown>
              <small *ngIf="fieldErrors['tariffType']" class="p-error">{{ fieldErrors['tariffType'] }}</small>
            </div>
            <div class="grid-item">
              <label>Basis</label>
              <div class="flex">
                <p-dropdown [options]="basisOptions" [(ngModel)]="selectedTariff.basis" (ngModelChange)="onFieldChange('basis', selectedTariff.basis)" [ngClass]="getFieldErrorClass('basis')" [ngStyle]="getFieldErrorStyle('basis')" placeholder="Select Basis" class="flex-1"></p-dropdown>
                <button pButton icon="pi pi-ellipsis-h" class="p-button-sm ml-2" (click)="openMaster('basis')"></button>
              </div>
              <small *ngIf="fieldErrors['basis']" class="p-error">{{ fieldErrors['basis'] }}</small>
            </div>
            <div class="grid-item">
              <label>Container Type</label>
              <div class="flex">
                <p-dropdown [options]="containerTypeOptions" [(ngModel)]="selectedTariff.containerType" (ngModelChange)="onFieldChange('containerType', selectedTariff.containerType)" [ngClass]="getFieldErrorClass('containerType')" [ngStyle]="getFieldErrorStyle('containerType')" placeholder="Select Container Type" class="flex-1"></p-dropdown>
                <button pButton icon="pi pi-ellipsis-h" class="p-button-sm ml-2" (click)="openMaster('containerType')"></button>
              </div>
              <small *ngIf="fieldErrors['containerType']" class="p-error">{{ fieldErrors['containerType'] }}</small>
            </div>
            <div class="grid-item">
              <label>Item Name</label>
              <p-dropdown [options]="itemNameOptions" [(ngModel)]="selectedTariff.itemName" (ngModelChange)="onFieldChange('itemName', selectedTariff.itemName)" [ngClass]="getFieldErrorClass('itemName')" [ngStyle]="getFieldErrorStyle('itemName')" placeholder="Select Item Name"></p-dropdown>
              <small *ngIf="fieldErrors['itemName']" class="p-error">{{ fieldErrors['itemName'] }}</small>
            </div>
            <div class="grid-item">
              <label>Currency</label>
              <div class="flex">
                <p-dropdown [options]="currencyOptions" [(ngModel)]="selectedTariff.currency" (ngModelChange)="onFieldChange('currency', selectedTariff.currency)" [ngClass]="getFieldErrorClass('currency')" [ngStyle]="getFieldErrorStyle('currency')" placeholder="Select Currency" class="flex-1"></p-dropdown>
                <button pButton icon="pi pi-ellipsis-h" class="p-button-sm ml-2" (click)="openMaster('currency')"></button>
              </div>
              <small *ngIf="fieldErrors['currency']" class="p-error">{{ fieldErrors['currency'] }}</small>
            </div>
            <div class="grid-item">
              <label>From</label>
              <p-dropdown appendTo="body" [options]="locationOptions" [(ngModel)]="selectedTariff.from" (ngModelChange)="onFieldChange('from', selectedTariff.from)" [ngClass]="getFieldErrorClass('from')" [ngStyle]="getFieldErrorStyle('from')" placeholder="Select From Location"></p-dropdown>
              <small *ngIf="fieldErrors['from']" class="p-error">{{ fieldErrors['from'] }}</small>
            </div>
            <div class="grid-item">
              <label>To</label>
              <p-dropdown appendTo="body" [options]="locationOptions" [(ngModel)]="selectedTariff.to" (ngModelChange)="onFieldChange('to', selectedTariff.to)" [ngClass]="getFieldErrorClass('to')" [ngStyle]="getFieldErrorStyle('to')" placeholder="Select To Location"></p-dropdown>
              <small *ngIf="fieldErrors['to']" class="p-error">{{ fieldErrors['to'] }}</small>
            </div>
            <div class="grid-item">
              <label>Party Type</label>
              <p-dropdown [options]="partyTypeOptions" [(ngModel)]="selectedTariff.partyType" (ngModelChange)="onPartyTypeChange()" placeholder="Select Party Type"></p-dropdown>
            </div>
            <div class="grid-item" *ngIf="selectedTariff.partyType">
              <label>Party Name</label>
              <div class="flex">
                <p-dropdown 
                  [options]="selectedTariff.partyType === 'Customer' ? customerOptions : vendorOptions" 
                  [(ngModel)]="selectedTariff.partyName" 
                  (ngModelChange)="onFieldChange('partyName', selectedTariff.partyName)" 
                  [ngClass]="getFieldErrorClass('partyName')" 
                  [ngStyle]="getFieldErrorStyle('partyName')" 
                  placeholder="Select {{ selectedTariff.partyType }}" 
                  class="flex-1">
                </p-dropdown>
                <button pButton icon="pi pi-ellipsis-h" class="p-button-sm ml-2" (click)="openMaster('partyType')"></button>
              </div>
              <small *ngIf="fieldErrors['partyName']" class="p-error">{{ fieldErrors['partyName'] }}</small>
            </div>
            <div class="grid-item">
              <label>Effective Date</label>
              <p-calendar [(ngModel)]="selectedTariff.effectiveDate" dateFormat="dd-mm-yy" showIcon="true" appendTo="body"></p-calendar>
            </div>
            <div class="grid-item">
              <label>Period Start Date</label>
              <p-calendar [(ngModel)]="selectedTariff.periodStartDate" dateFormat="dd-mm-yy" showIcon="true" appendTo="body"></p-calendar>
            </div>
            <div class="grid-item">
              <label>Period End Date</label>
              <p-calendar [(ngModel)]="selectedTariff.periodEndDate" dateFormat="dd-mm-yy" showIcon="true" appendTo="body"></p-calendar>
            </div>
            <div class="grid-item">
              <label>Charges</label>
              <input pInputText type="number" [(ngModel)]="selectedTariff.charges" (ngModelChange)="onFieldChange('charges', selectedTariff.charges)" [ngClass]="getFieldErrorClass('charges')" [ngStyle]="getFieldErrorStyle('charges')"/>
              <small *ngIf="fieldErrors['charges']" class="p-error">{{ fieldErrors['charges'] }}</small>
            </div>
            <div class="grid-item">
              <label>Freight Charge Type</label>
              <p-dropdown appendTo="body" [options]="freightChargeTypeOptions" [(ngModel)]="selectedTariff.freightChargeType" placeholder="Select Freight Charge Type"></p-dropdown>
            </div>
          
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="hideDialog()"></button>
          <button pButton label="{{ selectedTariff?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()" [disabled]="!isFormValid"></button>
        </div>
      </ng-template>
    </p-dialog>
    
    <!-- Currency Code Dialog -->
    <p-dialog
      header="Currency Codes"
      [(visible)]="showCurrencyDialog"
      [modal]="true"
      [style]="{ width: '900px' }"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
    >
      <ng-template pTemplate="content">
        <currency-code></currency-code>
      </ng-template>
    </p-dialog>

    <!-- Container Code Dialog -->
    <p-dialog
      header="Container Codes"
      [(visible)]="showContainerDialog"
      [modal]="true"
      [style]="{ width: '900px' }"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
    >
      <ng-template pTemplate="content">
        <container-code></container-code>
      </ng-template>
    </p-dialog>
    
    <!-- Customer Master Dialog -->
    <p-dialog
      header="Customer Master"
      [(visible)]="showCustomerDialog"
      [modal]="true"
      [style]="{ width: '900px' }"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
    >
      <ng-template pTemplate="content">
        <customer-master></customer-master>
      </ng-template>
    </p-dialog>
    
    <!-- Vendor Master Dialog -->
    <p-dialog
      header="Vendor Master"
      [(visible)]="showVendorDialog"
      [modal]="true"
      [style]="{ width: '900px' }"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
    >
      <ng-template pTemplate="content">
        <vendor-master></vendor-master>
      </ng-template>
    </p-dialog>
    
    <!-- UOM (Basis) Dialog -->
    <p-dialog
      header="Unit of Measure (Basis Only)"
      [(visible)]="showUOMDialog"
      [modal]="true"
      [style]="{ width: '900px' }"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
    >
      <ng-template pTemplate="content">
        <master-uom></master-uom>
      </ng-template>
    </p-dialog>
  `
})
export class TariffComponent implements OnInit, OnDestroy {
  private contextSubscription: Subscription | undefined;
  tariffs: any[] = [];
  modeOptions = [
    { label: 'IMPORT', value: 'IMPORT' },
    { label: 'EXPORT', value: 'EXPORT' }
  ];
  shippingTypeOptions: any[] = [];
  cargoTypeOptions: any[] = [];
  tariffTypeOptions: any[] = [];
  basisOptions: any[] = [];
  containerTypeOptions: any[] = [];
  itemNameOptions: any[] = [];
  currencyOptions: any[] = [];
  locationOptions: any[] = [];
  containerCodeOptions: any[] = [];
  currencyCodeOptions: any[] = [];
  itemCodeOptions: any[] = [];
  uomOptions: any[]=[];
  
  partyTypeOptions = [
    { label: 'Customer', value: 'Customer' },
    { label: 'Vendor', value: 'Vendor' }
  ];
  customerOptions: any[] = [];
  vendorOptions: any[] = [];
  freightChargeTypeOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'Sell Freight Rate', value: 'Sell Freight Rate' },
    { label: 'Buy Freight Rate', value: 'Buy Freight Rate' }
  ];
  isDialogVisible = false;
  selectedTariff: any = null;
  showCurrencyDialog = false;
  showContainerDialog = false;
  showCustomerDialog = false;
  showVendorDialog = false;
  showUOMDialog = false;

  // Field validation states
  fieldErrors: { [key: string]: string } = {};
  isFormValid = false;

  constructor(
    private messageService: MessageService,
    private masterCodeService: MasterCodeService,
    private masterTypeService: MasterTypeService,
    private masterLocationService: MasterLocationService,
    private tariffService: TariffService,
    private masterUOMService: MasterUOMService,
    private containerCodeService: ContainerCodeService,
    private masterItemService: MasterItemService,
    private currencyCodeService: CurrencyCodeService,
    private customerService: CustomerService,
    private vendorService: VendorService,
    private configService: ConfigService,
    private contextService: ContextService
  ) {}

  // Validation methods
  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'code':
        if (!value || value.toString().trim() === '') {
          return 'Code is required';
        }
        if (this.selectedTariff?.isNew && this.isCodeDuplicate(value)) {
          return 'Code already exists';
        }
        break;
      case 'mode':
        if (!value) {
          return 'Mode is required';
        }
        break;
      // All other fields are now optional - no validation required
      case 'shippingType':
      case 'cargoType':
      case 'tariffType':
      case 'basis':
      case 'containerType':
      case 'itemName':
      case 'currency':
      case 'from':
      case 'to':
      case 'partyType':
      case 'partyName':
      case 'charges':
        // These fields are optional - no validation needed
        break;
    }
    return '';
  }

  onFieldChange(fieldName: string, value: any) {
    const error = this.validateField(fieldName, value);
    if (error) {
      this.fieldErrors[fieldName] = error;
    } else {
      delete this.fieldErrors[fieldName];
    }
    this.updateFormValidity();
  }

  updateFormValidity() {
    // Only code and mode are required fields
    const requiredFields = ['code', 'mode'];

    this.isFormValid = requiredFields.every(field => 
      !this.fieldErrors[field] && 
      this.selectedTariff?.[field] && 
      this.selectedTariff[field].toString().trim() !== ''
    );
  }

  isCodeDuplicate(code: string): boolean {
    if (!this.selectedTariff?.isNew) return false;
    const codeValue = code.trim().toLowerCase();
    return this.tariffs.some(t => 
      (t.code || '').trim().toLowerCase() === codeValue
    );
  }

  getFieldErrorClass(fieldName: string): string {
    return this.fieldErrors[fieldName] ? 'p-invalid' : '';
  }

  getFieldErrorStyle(fieldName: string): { [key: string]: string } {
    return this.fieldErrors[fieldName] ? { 'border-color': '#f44336' } : {};
  }

  ngOnInit() {
    this.loadAllData();

    // Subscribe to context changes to reload data
    this.contextSubscription = this.contextService.context$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadAllData();
    });
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  private loadAllData() {
    forkJoin([
      this.loadShippingTypeOptions(),
      this.loadCargoTypeOptions(),
      this.loadTariffTypeOptions(),
      this.loadLocationOptions(),
      this.loadbasisOptions(),
      this.loadContainersOptions(),
      this.loadCurrencyOptions(),
      this.loadItemOptions(),
      this.loadCustomerOptions(),
      this.loadVendorOptions()
    ]).subscribe(() => {
      this.refreshList();
    });
  }

  // Update all loadXOptions to return observables for forkJoin
  loadShippingTypeOptions() {
    return this.masterTypeService.getAll().pipe(
      // @ts-ignore
      tap((types: any[]) => {
      this.shippingTypeOptions = (types || [])
        .filter(t => t.key === 'SHIP_TYPE' && t.status === 'Active')
        .map(t => ({ label: t.value, value: t.value }));
      })
    );
  }
  loadCargoTypeOptions() {
    return this.masterTypeService.getAll().pipe(
      // @ts-ignore
      tap((types: any[]) => {
      this.cargoTypeOptions = (types || [])
        .filter(t => t.key === 'CARGO_TYPE' && t.status === 'Active')
        .map(t => ({ label: t.value, value: t.value }));
      })
    );
  }
  loadTariffTypeOptions() {
    return this.masterTypeService.getAll().pipe(
      // @ts-ignore
      tap((types: any[]) => {
      this.tariffTypeOptions = (types || [])
        .filter(t => t.key === 'TARIFF_TYPE' && t.status === 'Active')
        .map(t => ({ label: t.value, value: t.value }));
      })
    );
  }
  loadLocationOptions() {
    return this.masterLocationService.getAll().pipe(
      // @ts-ignore
      tap((locations: any[]) => {
      const uniqueCities = Array.from(new Set((locations || [])
        .filter(l => l.active && l.city)
        .map(l => l.city.trim())
        .filter(Boolean)));
      this.locationOptions = uniqueCities.map(city => ({ label: city, value: city }));
      })
    );
  }
  loadbasisOptions() {
    return this.masterUOMService.getAll().pipe(
      // @ts-ignore
      tap((uoms: any[]) => {
      this.basisOptions = (uoms || [])
          .filter(u => u.uom_type === 'BASIS' && u.active)
        .map(u => ({ label: u.code, value: u.code }));
      })
    );
  }
  loadContainersOptions() {
    return this.containerCodeService.getContainers().pipe(
      // @ts-ignore
      tap((containerCodes: any[]) => {
      this.containerTypeOptions = (containerCodes || [])
        .filter(c =>c.status==='Active')
        .map(c => ({ label: c.code, value: c.code }));
      })
    );
  }
  loadCurrencyOptions() {
    return this.currencyCodeService.getCurrencies().pipe(
      // @ts-ignore
      tap((currencyCodes: any[]) => {
      this.currencyOptions = (currencyCodes || [])
        .filter(c => c.status === 'Active')
        .map(c => ({ label: c.code, value: c.code }));
      })
    );
  }
  loadItemOptions() {
    return this.masterItemService.getAll().pipe(
      // @ts-ignore
      tap((items: any[]) => {
        this.itemNameOptions = (items || [])
          .filter(i => i.item_type === 'CHARGE' && i.active)
          .map(i => ({ label: `${i.code} - ${i.name}`, value: i.code }));
      })
    );
  }
  loadCustomerOptions() {
    return this.customerService.getAll().pipe(
      tap((customers: any[]) => {
        this.customerOptions = (customers || [])
          .map(c => ({ label: `${c.customer_no} - ${c.name}`, value: c.customer_no }));
      })
    );
  }
  loadVendorOptions() {
    return this.vendorService.getAll().pipe(
      tap((vendors: any[]) => {
       
        this.vendorOptions = (vendors || [])
          .map(v => ({
            label: `${v.vendor_no} - ${v.name}`,
            value: v.vendor_no
          }));
       
      })
    );
  }

  // Helper to map code to label for table display
  getLabel(options: any[], value: string): string {
    const found = options.find(opt => opt.value === value);
    return found ? found.label : value;
  }

  refreshList() {
    console.log('Refreshing tariff list - starting refreshList method');
    
    // Get the validation settings for context-based filtering
    const config = this.configService.getConfig();
    const tariffFilter = config?.validation?.tariffFilter || '';
    
    console.log('Tariff filter:', tariffFilter);
    
    // Check if we need to validate context for filtering
    if (tariffFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context for filtering:', context);
      
      // Check if the required context is set based on the filter
      if (tariffFilter.includes('C') && !context.companyCode) {
        console.log('Company context required but not set - showing empty list');
        this.tariffs = [];
        return;
      }
      
      if (tariffFilter.includes('B') && !context.branchCode) {
        console.log('Branch context required but not set - showing empty list');
        this.tariffs = [];
        return;
      }
      
      if (tariffFilter.includes('D') && !context.departmentCode) {
        console.log('Department context required but not set - showing empty list');
        this.tariffs = [];
        return;
      }
    }
    
    // Proceed with fetching data if context validation passes
    this.tariffService.getAll().subscribe({
      next: (data) => {
        console.log('Tariff data loaded successfully:', data.length, 'records');
        this.tariffs = data.map((tariff: any) => ({
          ...tariff,
          shippingType: tariff.shipping_type,
          cargoType: tariff.cargo_type,
          containerType: tariff.container_type,
          itemName: tariff.item_name,
          from: tariff.from_location,
          to: tariff.to_location,
          partyType: tariff.party_type,
          partyName: tariff.party_name,
          tariffType: tariff.tariff_type,
          basis: tariff.basis,
          currency: tariff.currency,
          charges: tariff.charges,
          mode: tariff.mode,
          effectiveDate: tariff.effective_date,
          periodStartDate: tariff.period_start_date,
          periodEndDate: tariff.period_end_date,
          freightChargeType: tariff.freight_charge_type,
          // ...add any other mappings as needed
        }));
      },
      error: (error) => {
        console.error('Error loading tariff data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tariff data'
        });
        this.tariffs = [];
      }
    });
  }

  addRow() {
    console.log('Add Tariff button clicked - starting addRow method');
    
    // Get the validation settings
    const config = this.configService.getConfig();
    const tariffFilter = config?.validation?.tariffFilter || '';
    
    console.log('Tariff filter:', tariffFilter);
    
    // Check if we need to validate context
    if (tariffFilter) {
      // Get the current context
      const context = this.contextService.getContext();
      
      console.log('Current context:', context);
      
      // Check if the required context is set based on the filter
      if (tariffFilter.includes('C') && !context.companyCode) {
        console.log('Company context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Company before adding a new tariff.'
        });
        this.contextService.showContextSelector();
        return;
      }
      
      if (tariffFilter.includes('B') && !context.branchCode) {
        console.log('Branch context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Branch before adding a new tariff.'
        });
        this.contextService.showContextSelector();
        return;
      }
      
      if (tariffFilter.includes('D') && !context.departmentCode) {
        console.log('Department context required but not set');
        this.messageService.add({
          severity: 'warn',
          summary: 'Context Required',
          detail: 'Please select a Department before adding a new tariff.'
        });
        this.contextService.showContextSelector();
        return;
      }
    }

    console.log('Context validation passed - proceeding with add tariff');
    
    // Existing addRow logic
    this.selectedTariff = {
      id: null,
      code: '',
      mode: '',
      // ... other fields
      isNew: true
    };
    this.isDialogVisible = true;
    this.fieldErrors = {};
    
    // Load options using forkJoin
    forkJoin([
      this.loadShippingTypeOptions(),
      this.loadCargoTypeOptions(),
      this.loadTariffTypeOptions(),
      this.loadLocationOptions(),
      this.loadbasisOptions(),
      this.loadContainersOptions(),
      this.loadCurrencyOptions(),
      this.loadItemOptions(),
      this.loadCustomerOptions(),
      this.loadVendorOptions()
    ]).subscribe();
  }

  editRow(tariff: any) {
    // Wait for all options to be loaded before opening dialog
    forkJoin([
      this.loadShippingTypeOptions(),
      this.loadCargoTypeOptions(),
      this.loadTariffTypeOptions(),
      this.loadLocationOptions(),
      this.loadbasisOptions(),
      this.loadContainersOptions(),
      this.loadCurrencyOptions(),
      this.loadItemOptions(),
      this.loadCustomerOptions(),
      this.loadVendorOptions()
    ]).subscribe(() => {
      console.log('TARIFF:', tariff);
      console.log('cargoTypeOptions:', this.cargoTypeOptions);
    this.selectedTariff = { ...tariff, isNew: false };
    this.fieldErrors = {};
    this.updateFormValidity();
    this.isDialogVisible = true;
    });
  }

  saveRow() {
    if (!this.selectedTariff || !this.isFormValid) return;
    const payload: any = { ...this.selectedTariff };

    if (this.selectedTariff.isNew) {
      this.tariffService.create(payload).subscribe({
        next: (created) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tariff created' });
          this.refreshList();
          this.hideDialog();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create tariff' });
        }
      });
    } else {
      this.tariffService.update(this.selectedTariff.id, payload).subscribe({
        next: (updated) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Tariff updated' });
          this.refreshList();
          this.hideDialog();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update tariff' });
        },
        complete: () => {
          console.log('Tariff updated successfully');
        }
      });
    }
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedTariff = null;
  }

  clear(table: any) {
    table.clear();
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onPartyTypeChange() {
    if (this.selectedTariff.partyType === 'Customer') {
      this.selectedTariff.partyName = '';
    } else if (this.selectedTariff.partyType === 'Vendor') {
      this.selectedTariff.partyName = '';
    }
    // Clear party name error and update validation
    delete this.fieldErrors['partyName'];
    this.updateFormValidity();
  }
  openMaster(type: string) {
    if (type === 'currency') {
      this.showCurrencyDialog = true;
    } else if (type === 'containerType') {
      this.showContainerDialog = true;
    } else if (type === 'partyType') {
      if (this.selectedTariff?.partyType === 'Customer') {
        this.showCustomerDialog = true;
      } else if (this.selectedTariff?.partyType === 'Vendor') {
        this.showVendorDialog = true;
      }
    } else if (type === 'carrier') {
      this.showVendorDialog = true;
    } else if (type === 'customer') {
      this.showCustomerDialog = true;
    } else if (type === 'basis') {
      this.showUOMDialog = true;
    } else {
      this.messageService.add({ severity: 'info', summary: 'Open Master', detail: `Open ${type} master page` });
    }
  }
}
