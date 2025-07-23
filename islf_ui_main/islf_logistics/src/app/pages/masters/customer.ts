import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { CustomerService, Customer, CustomerContact } from '../../services/customer.service';
import { NumberSeriesService } from '@/services/number-series.service';
import { MappingService } from '@/services/mapping.service';
import { MasterLocationService, MasterLocation } from '../../services/master-location.service';
import { MasterTypeService } from '../../services/mastertype.service';

function uniqueCaseInsensitive(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr.filter(val => {
    if (!val) return false;
    const lower = val.trim().toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

@Component({
  selector: 'customer-master',
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
    DialogModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Customer Master</div>
      <p-table
        #dt
        [value]="customers"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['customer_no', 'name', 'city', 'country', 'state', 'type']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Customer" icon="pi pi-plus" (click)="addRow()"></button>
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
                Customer No.
                <p-columnFilter type="text" field="customer_no" display="menu" placeholder="Search by customer no"></p-columnFilter>
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
                City
                <p-columnFilter type="text" field="city" display="menu" placeholder="Search by city"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Country
                <p-columnFilter type="text" field="country" display="menu" placeholder="Search by country"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                State
                <p-columnFilter type="text" field="state" display="menu" placeholder="Search by state"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Type
                <p-columnFilter type="text" field="type" display="menu" placeholder="Search by type"></p-columnFilter>
              </div>
            </th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-customer>
          <tr>
            <td>{{ customer.customer_no }}</td>
            <td>{{ customer.name }}</td>
            <td>{{ customer.city }}</td>
            <td>{{ customer.country }}</td>
            <td>{{ customer.state }}</td>
            <td>{{ customer.type }}</td>
            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(customer)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    <p-dialog
      header="{{ selectedCustomer?.isNew ? 'Add' : 'Edit' }} Customer"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '1500px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedCustomer" class="p-fluid form-grid dialog-body-padding">
          <!-- General -->
          <div class="section-header">General</div>
          <div class="grid-container">
            <div class="grid-item">
              <label>Customer No.</label>
              <input pInputText [(ngModel)]="selectedCustomer.customer_no" [disabled]="!isManualSeries || !selectedCustomer.isNew" (ngModelChange)="updateBillToCustomerNameDefault()" />
            </div>
            <div class="grid-item">
              <label>Customer Type</label>
              <p-dropdown [options]="customerTypeOptions" [(ngModel)]="selectedCustomer.type" optionLabel="label" optionValue="value" placeholder="Select Customer Type"></p-dropdown>
            </div>
            <div class="grid-item">
              <label>Name</label>
              <input pInputText [(ngModel)]="selectedCustomer.name" (ngModelChange)="updateBillToCustomerNameDefault()" />
            </div>
            <div class="grid-item">
              <label>Name2</label>
              <input pInputText [(ngModel)]="selectedCustomer.name2" />
            </div>
            <div class="grid-item">
              <label>Blocked</label>
              <p-dropdown [options]="blockedOptions" [(ngModel)]="selectedCustomer.blocked" optionLabel="label" optionValue="value" placeholder="Select Blocked"></p-dropdown>
            </div>
          </div>
          <!-- Address -->
          <div class="section-header">Address</div>
          <div class="grid-container">
            <div class="grid-item">
              <label>Address</label>
              <input pInputText [(ngModel)]="selectedCustomer.address" />
            </div>
            <div class="grid-item">
              <label>Address1</label>
              <input pInputText [(ngModel)]="selectedCustomer.address1" />
            </div>
            <div class="grid-item">
              <label>Country</label>
              <p-dropdown [options]="countryOptions" [(ngModel)]="selectedCustomer.country" optionLabel="label" optionValue="value" placeholder="Select Country" [filter]="true" (onChange)="onCountryChange()"></p-dropdown>
            </div>
            <div class="grid-item">
              <label>State</label>
              <p-dropdown [options]="stateOptions" [(ngModel)]="selectedCustomer.state" optionLabel="label" optionValue="value" placeholder="Select State" [filter]="true" (onChange)="onStateChange()"></p-dropdown>
            </div>
            <div class="grid-item">
              <label>City</label>
              <p-dropdown [options]="cityOptions" [(ngModel)]="selectedCustomer.city" optionLabel="label" optionValue="value" placeholder="Select City" [filter]="true"></p-dropdown>
            </div>
            <div class="grid-item">
              <label>Postal Code</label>
              <input pInputText [(ngModel)]="selectedCustomer.postal_code" />
            </div>
            <div class="grid-item">
              <label>Website</label>
              <input pInputText [(ngModel)]="selectedCustomer.website" />
            </div>
          </div>
          <!-- Invoicing -->
          <div class="section-header">Invoicing</div>
          <div class="grid-container">
            <div class="grid-item">
              <label>Bill-to Customer Name (Auto):</label>
              <p-dropdown
                [options]="billToCustomerOptions"
                [(ngModel)]="selectedCustomer.bill_to_customer_name"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Bill-to Customer"
                [filter]="true"
                [editable]="true">
              </p-dropdown>
            </div>
            <div class="grid-item">
              <label>VAT/GST No.</label>
              <input pInputText [(ngModel)]="selectedCustomer.vat_gst_no" />
            </div>
            <div class="grid-item">
              <label>Place of Supply</label>
              <p-dropdown [options]="placeOfSupplyOptions" [(ngModel)]="selectedCustomer.place_of_supply" optionLabel="label" optionValue="value" placeholder="Select Place of Supply"></p-dropdown>
            </div>
            <div class="grid-item">
              <label>PAN No.</label>
              <input pInputText [(ngModel)]="selectedCustomer.pan_no" />
            </div>
            <div class="grid-item">
              <label>TAN No.</label>
              <input pInputText [(ngModel)]="selectedCustomer.tan_no" />
            </div>
          </div>
          <!-- Contact -->
          <div class="section-header">Contact</div>
          <p-table [value]="selectedCustomer.contacts" [showGridlines]="true" [responsiveLayout]="'scroll'">
            <ng-template pTemplate="header">
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Mobile</th>
                <th>Landline</th>
                <th>Email</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-contact let-rowIndex="rowIndex">
              <tr>
                <td><input pInputText [(ngModel)]="contact.name" /></td>
                <td><input pInputText [(ngModel)]="contact.department" /></td>
                <td><input pInputText [(ngModel)]="contact.mobile" /></td>
                <td><input pInputText [(ngModel)]="contact.landline" /></td>
                <td><input pInputText [(ngModel)]="contact.email" /></td>
                <td><input pInputText [(ngModel)]="contact.remarks" /></td>
                <td>
                  <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeContact(rowIndex)"></button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="footer">
              <tr>
                <td colspan="7">
                  <button pButton label="Add Contact" icon="pi pi-plus" (click)="addContact()"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="hideDialog()"></button>
          <button pButton label="{{ selectedCustomer?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()"></button>
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
export class CustomerComponent implements OnInit {
  customers: Customer[] = [];
  customerTypeOptions: any[] = [];
  blockedOptions = [
    { label: 'Ship', value: true },
    { label: 'All', value: false }
  ];
  countryOptions: any[] = [];
  stateOptions: any[] = [];
  cityOptions: any[] = [];
  billToCustomerOptions: any[] = [];
  placeOfSupplyOptions: any[] = [];
  mappedCustomerSeriesCode: string | null = null;
  isManualSeries: boolean = false;
  isDialogVisible = false;
  selectedCustomer: (Customer & { isNew?: boolean }) | null = null;
  allLocations: MasterLocation[] = [];

  constructor(
    private customerService: CustomerService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private messageService: MessageService,
    private masterLocationService: MasterLocationService,
    private masterTypeService: MasterTypeService
  ) {}

  ngOnInit() {
    this.refreshList();
    this.loadOptions();
    this.loadLocations();
    this.loadMappedCustomerSeriesCode();
  }

  loadOptions() {
    // Load customer type options from master type where key === 'Customer' and status === 'Active'
    this.masterTypeService.getAll().subscribe((types: any[]) => {
      this.customerTypeOptions = (types || [])
        .filter(t => t.key === 'Customer' && t.status === 'Active')
        .map(t => ({ label: t.value, value: t.value }));
    });
    // TODO: Load other dropdown options as needed
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refreshList() {
    this.customerService.getAll().subscribe(data => {
      this.customers = data;
      this.billToCustomerOptions = data.map(c => ({
        label: `${c.customer_no} - ${c.name}`,
        value: `${c.customer_no} - ${c.name}`
      }));
    });
  }

  loadMappedCustomerSeriesCode() {
    this.mappingService.getMapping().subscribe(mapping => {
      this.mappedCustomerSeriesCode = mapping.customerCode;
      if (this.mappedCustomerSeriesCode) {
        this.numberSeriesService.getAll().subscribe(seriesList => {
          const found = seriesList.find((s: any) => s.code === this.mappedCustomerSeriesCode);
          this.isManualSeries = !!(found && found.is_manual);
        });
      } else {
        this.isManualSeries = false;
      }
    });
  }

  addRow() {
    this.selectedCustomer = {
      customer_no: '',
      type: '',
      name: '',
      name2: '',
      blocked: false,
      address: '',
      address1: '',
      country: '',
      state: '',
      city: '',
      postal_code: '',
      website: '',
      bill_to_customer_name: '',
      vat_gst_no: '',
      place_of_supply: '',
      pan_no: '',
      tan_no: '',
      contacts: [],
      isNew: true
    };
    this.isDialogVisible = true;
    this.updateBillToCustomerNameDefault();
  }

  updateBillToCustomerNameDefault() {
    if (this.selectedCustomer) {
      let no = this.selectedCustomer.customer_no;
      if (!this.isManualSeries) {
        no = '(auto)';
      }
      const liveValue = `${no || ''} - ${this.selectedCustomer.name || ''}`.trim();
      if (
        !this.selectedCustomer.bill_to_customer_name ||
        (Array.isArray(this.billToCustomerOptions) && this.billToCustomerOptions.every(opt => opt.value !== this.selectedCustomer!.bill_to_customer_name))
      ) {
        this.selectedCustomer.bill_to_customer_name = liveValue;
      }
    }
  }

  editRow(customer: Customer) {
    this.selectedCustomer = { ...customer, isNew: false };
    // Always set Bill-to Customer Name to the real value on edit
    if (this.selectedCustomer.customer_no && this.selectedCustomer.name) {
      this.selectedCustomer.bill_to_customer_name = `${this.selectedCustomer.customer_no} - ${this.selectedCustomer.name}`;
    }
    this.isDialogVisible = true;
  }

  saveRow() {
    if (!this.selectedCustomer) return;
    const payload: any = {
      ...this.selectedCustomer,
      seriesCode: this.mappedCustomerSeriesCode // Always use mapped code
    };
    if (!this.isManualSeries) {
      payload.customer_no = undefined; // Let backend generate
    }
    const req = this.selectedCustomer.isNew
      ? this.customerService.create(payload)
      : this.customerService.update(this.selectedCustomer.id!, this.selectedCustomer);
    req.subscribe({
      next: (createdCustomer) => {
        // Update Bill-to Customer Name with the real number after save
        if (createdCustomer && createdCustomer.customer_no && createdCustomer.name) {
          this.selectedCustomer!.bill_to_customer_name = `${createdCustomer.customer_no} - ${createdCustomer.name}`;
        }
        const msg = this.selectedCustomer?.isNew ? 'Customer created' : 'Customer updated';
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
    this.selectedCustomer = null;
  }

  addContact() {
    if (this.selectedCustomer) {
      this.selectedCustomer.contacts.push({ name: '', department: '', mobile: '', landline: '', email: '', remarks: '' });
    }
  }

  removeContact(index: number) {
    if (this.selectedCustomer) {
      this.selectedCustomer.contacts.splice(index, 1);
    }
  }

  clear(table: any) {
    table.clear();
  }

  loadLocations() {
    this.masterLocationService.getAll().subscribe(locations => {
      this.allLocations = locations.filter(l => l.active);
      // Unique countries
      this.countryOptions = uniqueCaseInsensitive(this.allLocations.map(l => l.country))
        .map(c => ({ label: toTitleCase(c), value: c }));
      // Reset state and city options
      this.stateOptions = [];
      this.cityOptions = [];
      // Place of Supply: GST_LOCATION type, format 'gst_state_code-name'
      const gstLocations = this.allLocations.filter(l => l.type === 'GST_LOCATION');
      this.placeOfSupplyOptions = uniqueCaseInsensitive(gstLocations.map(l => `${l.gst_state_code}-${l.name}`))
        .map(val => ({ label: val, value: val }));
    });
  }

  onCountryChange() {
    if (!this.selectedCustomer || !this.selectedCustomer.country) {
      this.stateOptions = [];
      this.cityOptions = [];
      if (this.selectedCustomer) {
        this.selectedCustomer.state = '';
        this.selectedCustomer.city = '';
      }
      return;
    }
    const states = this.allLocations
      .filter(l => l.country === this.selectedCustomer!.country)
      .map(l => l.state)
      .filter(Boolean);
    this.stateOptions = uniqueCaseInsensitive(states).map(s => ({ label: toTitleCase(s), value: s }));
    this.cityOptions = [];
    this.selectedCustomer.state = '';
    this.selectedCustomer.city = '';
  }

  onStateChange() {
    if (!this.selectedCustomer || !this.selectedCustomer.state) {
      this.cityOptions = [];
      if (this.selectedCustomer) {
        this.selectedCustomer.city = '';
      }
      return;
    }
    const cities = this.allLocations
      .filter(l => l.country === this.selectedCustomer!.country && l.state === this.selectedCustomer!.state)
      .map(l => l.city)
      .filter(Boolean);
    this.cityOptions = uniqueCaseInsensitive(cities).map(c => ({ label: toTitleCase(c), value: c }));
    this.selectedCustomer.city = '';
  }
} 