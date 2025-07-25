import { Component, OnInit } from '@angular/core';
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
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomerService } from '@/services/customer.service';
import { VendorService } from '@/services/vendor.service';
import { CurrencyCodeComponent } from './currencycode';
import { ContainerCodeComponent } from './containercode';
import { CustomerComponent } from './customer';
import { VendorComponent } from './vendor';
import { MasterUOMComponent } from './masteruom';
// Import all required services (to be implemented or stubbed)
// ... existing code ...
@Component({
  selector: 'tariff-master',
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
              <label>Code</label>
              <input pInputText [(ngModel)]="selectedTariff.code" />
            </div>
            <div class="grid-item">
              <label>Mode</label>
              <p-dropdown [options]="modeOptions" [(ngModel)]="selectedTariff.mode" placeholder="Select Mode"></p-dropdown>
            </div>
            <div class="grid-item">
              <label>Shipping Type</label>
              <div class="flex">
                <p-dropdown [options]="shippingTypeOptions" [(ngModel)]="selectedTariff.shippingType" placeholder="Select ShippingType" class="flex-1"></p-dropdown>
            
              </div>
            </div>
            <div class="grid-item">
              <label>Cargo Type</label>
              <div class="flex">
                <p-dropdown [options]="cargoTypeOptions" [(ngModel)]="selectedTariff.cargoType" placeholder="Select CargoType" class="flex-1"></p-dropdown>
                
              </div>
            </div>
            <div class="grid-item">
              <label>Tariff Type</label>
              <div class="flex">
                <p-dropdown [options]="tariffTypeOptions" [(ngModel)]="selectedTariff.tariffType" placeholder="Select TariffType" class="flex-1"></p-dropdown>

              </div>
            </div>
            <div class="grid-item">
              <label>Basis</label>
              <div class="flex">
                <p-dropdown [options]="basisOptions" [(ngModel)]="selectedTariff.basis" placeholder="Select Basis" class="flex-1"></p-dropdown>
                <button pButton icon="pi pi-ellipsis-h" class="p-button-sm ml-2" (click)="openMaster('basis')"></button>
              </div>
            </div>
            <div class="grid-item">
              <label>Container Type</label>
              <div class="flex">
                <p-dropdown [options]="containerTypeOptions" [(ngModel)]="selectedTariff.containerType" placeholder="Select ContainerType" class="flex-1"></p-dropdown>
                <button pButton icon="pi pi-ellipsis-h" class="p-button-sm ml-2" (click)="openMaster('containerType')"></button>
              </div>
            </div>
            <div class="grid-item">
              <label>Item Name</label>
              <div class="flex">
                <p-dropdown [options]="itemNameOptions" [(ngModel)]="selectedTariff.itemName" placeholder="Select Item Name" class="flex-1"></p-dropdown>
            
              </div>
            </div>
            <div class="grid-item">
              <label>Currency</label>
              <div class="flex">
                <p-dropdown [options]="currencyOptions" [(ngModel)]="selectedTariff.currency" placeholder="Select Currency" class="flex-1"></p-dropdown>
                <button pButton icon="pi pi-ellipsis-h" class="p-button-sm ml-2" (click)="openMaster('currency')"></button>
              </div>
            </div>
            <div class="grid-item">
              <label>From</label>
              <p-dropdown  appendTo="body" [options]="locationOptions" [(ngModel)]="selectedTariff.from" placeholder="From..." [filter]="true"></p-dropdown>
            </div>
            <div class="grid-item">
              <label>To</label>
              <p-dropdown appendTo="body" [options]="locationOptions" [(ngModel)]="selectedTariff.to" placeholder="To..." [filter]="true"></p-dropdown>
            </div>
            <div class="grid-item">
              <label>Party Type</label>
              <p-dropdown [options]="partyTypeOptions" [(ngModel)]="selectedTariff.partyType" placeholder="Select PartyType" (onChange)="onPartyTypeChange()"></p-dropdown>
            </div>
            <div class="grid-item" *ngIf="selectedTariff.partyType === 'Customer'">
              <label>Customer Name</label>
              <div class="flex">
                <p-dropdown
                  [options]="customerOptions"
                  [(ngModel)]="selectedTariff.partyName"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Customer"
                  class="flex-1"
                  appendTo="body"
                  [filter]="true"
                ></p-dropdown>
                <button
                  pButton
                  icon="pi pi-ellipsis-h"
                  class="p-button-sm ml-2"
                  (click)="openMaster('customer')"
                ></button>
              </div>
            </div>
            <div class="grid-item" *ngIf="selectedTariff.partyType === 'Vendor'">
              <label>Carrier</label>
              <div class="flex">
                <p-dropdown
                  [options]="vendorOptions"
                  [(ngModel)]="selectedTariff.partyName"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Carrier"
                  class="flex-1"
                  appendTo="body"
                  [filter]="true"
                ></p-dropdown>
                <button
                  pButton
                  icon="pi pi-ellipsis-h"
                  class="p-button-sm ml-2"
                  (click)="openMaster('carrier')"
                ></button>
              </div>
            </div>
              <div class="grid-item">
                <label>Effective Date</label>
                <p-calendar [(ngModel)]="selectedTariff.effectiveDate" dateFormat="dd-mm-yy" showIcon="true"  appendTo="body"></p-calendar>
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
              <input pInputText type="number" [(ngModel)]="selectedTariff.charges" />
            </div>
            <div class="grid-item">
              <label>Freight Charge Type</label>
              <p-dropdown appendTo="body" [options]="freightChargeTypeOptions" [(ngModel)]="selectedTariff.freightChargeType" placeholder="Select Freight Charge Type "></p-dropdown>
            </div>
          
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="hideDialog()"></button>
          <button pButton label="{{ selectedTariff?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()"></button>
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
    .section-header {
      font-weight: bold;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
      font-size: 1.1rem;
    }
    label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class TariffComponent implements OnInit {
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
    private vendorService: VendorService
  ) {}

  ngOnInit() {
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
        .filter(t => t.key === 'ShipType' && t.status === 'Active')
        .map(t => ({ label: t.value, value: t.value }));
      })
    );
  }
  loadCargoTypeOptions() {
    return this.masterTypeService.getAll().pipe(
      // @ts-ignore
      tap((types: any[]) => {
      this.cargoTypeOptions = (types || [])
        .filter(t => t.key === 'CargoType' && t.status === 'Active')
        .map(t => ({ label: t.value, value: t.value }));
      })
    );
  }
  loadTariffTypeOptions() {
    return this.masterTypeService.getAll().pipe(
      // @ts-ignore
      tap((types: any[]) => {
      this.tariffTypeOptions = (types || [])
        .filter(t => t.key === 'TariffType' && t.status === 'Active')
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
          .filter(u => u.uom_type === 'Basis' && u.active)
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
          .filter(i => i.item_type === 'Charge' && i.active)
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
    this.tariffService.getAll().subscribe(data => {
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
    });
  }

  addRow() {
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
    this.selectedTariff = {
      code: '',
      mode: '',
      shippingType: '',
      cargoType: '',
      tariffType: '',
      basis: '',
      containerType: '',
      itemName: '',
      currency: '',
      from: '',
      to: '',
      partyType: '',
      partyName: '',
      charges: '',
      freightChargeType: '',
      effectiveDate: null,
      periodStartDate: null,
      periodEndDate: null,
      isNew: true
    };
    this.isDialogVisible = true;
    });
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
    this.isDialogVisible = true;
    });
  }

  saveRow() {
    if (!this.selectedTariff) return;
    const payload: any = { ...this.selectedTariff };

    // List of required fields and their user-friendly names
    const requiredFields = [
      { key: 'code', label: 'Code' },
      { key: 'mode', label: 'Mode' },
      { key: 'shippingType', label: 'Shipping Type' },
      { key: 'cargoType', label: 'Cargo Type' },
      { key: 'tariffType', label: 'Tariff Type' },
      { key: 'basis', label: 'Basis' },
      { key: 'containerType', label: 'Container Type' },
      { key: 'itemName', label: 'Item Name' },
      { key: 'currency', label: 'Currency' },
      { key: 'from', label: 'From' },
      { key: 'to', label: 'To' },
      { key: 'partyType', label: 'Party Type' },
      { key: 'charges', label: 'Charges' }
    ];
    if (payload.partyType === 'Customer') {
      requiredFields.push({ key: 'partyName', label: 'Customer Name' });
    } else if (payload.partyType === 'Vendor') {
      requiredFields.push({ key: 'partyName', label: 'Carrier' });
    }
    const missing = requiredFields
      .filter(field => !payload[field.key] || payload[field.key].toString().trim() === '')
      .map(field => field.label);
    if (missing.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Required Fields',
        detail: `Please fill: ${missing.join(', ')}`
      });
      return;
    }

    // Unique code check (for new tariffs)
    if (this.selectedTariff.isNew) {
      const codeValue = (payload.code || '').trim().toLowerCase();
      const duplicate = this.tariffs.some(
        t => (t.code || '').trim().toLowerCase() === codeValue
      );
      if (duplicate) {
        this.messageService.add({
          severity: 'error',
          summary: 'Duplicate Code',
          detail: 'Code already exists. Please use a unique code.'
        });
        return;
      }
    }

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
// ... existing code ... 