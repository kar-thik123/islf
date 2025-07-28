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
import { VendorService, Vendor, VendorContact } from '../../services/vendor.service';
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
  selector: 'vendor-master',
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
      <div class="font-semibold text-xl mb-4">Vendor Master</div>
      <p-table
        #dt
        [value]="vendors"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['vendor_no', 'name', 'city', 'country', 'state', 'type']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Vendor" icon="pi pi-plus" (click)="addRow()"></button>
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
                Vendor No.
                <p-columnFilter type="text" field="vendor_no" display="menu" placeholder="Search by vendor no"></p-columnFilter>
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
        <ng-template pTemplate="body" let-vendor>
          <tr>
            <td>{{ vendor.vendor_no }}</td>
            <td>{{ vendor.name }}</td>
            <td>{{ vendor.city }}</td>
            <td>{{ vendor.country }}</td>
            <td>{{ vendor.state }}</td>
            <td>{{ vendor.type }}</td>
            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(vendor)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    <p-dialog
      header="{{ selectedVendor?.isNew ? 'Add' : 'Edit' }} Vendor"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '1500px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedVendor" class="p-fluid form-grid dialog-body-padding">
          <!-- General -->
          <div class="section-header">General</div>
          <div class="grid-container">
            <div class="grid-item">
              <label for="vendor_no">Vendor No. <span class="text-red-500">*</span></label>
              <input #vendorNoInput id="vendor_no" pInputText [(ngModel)]="selectedVendor.vendor_no" [disabled]="!isManualSeries || !selectedVendor.isNew" (ngModelChange)="updateBillToVendorNameDefault(); onFieldChange('vendor_no', vendorNoInput.value)" (blur)="onFieldBlur('vendor_no')" required />
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('vendor_no')">{{ getFieldError('vendor_no') }}</small>
            </div>
            <div class="grid-item">
              <label for="type">Vendor Type <span class="text-red-500">*</span></label>
              <p-dropdown id="type" [options]="vendorTypeOptions" [(ngModel)]="selectedVendor.type" optionLabel="label" optionValue="value" placeholder="Select Vendor Type" (onChange)="onFieldChange('type', $event.value)" (onBlur)="onFieldBlur('type')" required></p-dropdown>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('type')">{{ getFieldError('type') }}</small>
            </div>
            <div class="grid-item">
              <label for="name">Name <span class="text-red-500">*</span></label>
              <input #nameInput id="name" pInputText [(ngModel)]="selectedVendor.name" (ngModelChange)="updateBillToVendorNameDefault(); onFieldChange('name', nameInput.value)" (blur)="onFieldBlur('name')" required />
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('name')">{{ getFieldError('name') }}</small>
            </div>
            <div class="grid-item">
              <label>Name2</label>
              <input pInputText [(ngModel)]="selectedVendor.name2" />
            </div>
            <div class="grid-item">
              <label>Blocked</label>
              <p-dropdown [options]="blockedOptions" [(ngModel)]="selectedVendor.blocked" optionLabel="label" optionValue="value" placeholder="Select Blocked"></p-dropdown>
            </div>
          </div>
          <!-- Address -->
          <div class="section-header">Address</div>
          <div class="grid-container">
            <div class="grid-item">
              <label>Address</label>
              <input pInputText [(ngModel)]="selectedVendor.address" />
            </div>
            <div class="grid-item">
              <label>Address1</label>
              <input pInputText [(ngModel)]="selectedVendor.address1" />
            </div>
            <div class="grid-item">
              <label for="country">Country <span class="text-red-500">*</span></label>
              <p-dropdown id="country" [options]="countryOptions" [(ngModel)]="selectedVendor.country" optionLabel="label" optionValue="value" placeholder="Select Country" [filter]="true" (onChange)="onCountryChange(); onFieldChange('country', $event.value)" (onBlur)="onFieldBlur('country')" required></p-dropdown>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('country')">{{ getFieldError('country') }}</small>
            </div>
            <div class="grid-item">
              <label for="state">State <span class="text-red-500">*</span></label>
              <p-dropdown id="state" [options]="stateOptions" [(ngModel)]="selectedVendor.state" optionLabel="label" optionValue="value" placeholder="Select State" [filter]="true" (onChange)="onStateChange(); onFieldChange('state', $event.value)" (onBlur)="onFieldBlur('state')" required></p-dropdown>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('state')">{{ getFieldError('state') }}</small>
            </div>
            <div class="grid-item">
              <label for="city">City <span class="text-red-500">*</span></label>
              <p-dropdown id="city" [options]="cityOptions" [(ngModel)]="selectedVendor.city" optionLabel="label" optionValue="value" placeholder="Select City" [filter]="true" (onChange)="onFieldChange('city', $event.value)" (onBlur)="onFieldBlur('city')" required></p-dropdown>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('city')">{{ getFieldError('city') }}</small>
            </div>
            <div class="grid-item">
              <label>Postal Code</label>
              <input pInputText [(ngModel)]="selectedVendor.postal_code" />
            </div>
            <div class="grid-item">
              <label>Website</label>
              <input pInputText [(ngModel)]="selectedVendor.website" />
            </div>
          </div>
          <!-- Invoicing -->
          <div class="section-header">Invoicing</div>
          <div class="grid-container">
            <div class="grid-item">
              <label>Bill-to Vendor Name (Auto):</label>
              <p-dropdown
                [options]="billToVendorOptions"
                [(ngModel)]="selectedVendor.bill_to_vendor_name"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Bill-to Vendor"
                [filter]="true"
                [editable]="true">
              </p-dropdown>
            </div>
            <div class="grid-item">
              <label for="vat_gst_no">VAT/GST No. <span class="text-red-500">*</span></label>
              <input #vatGstInput id="vat_gst_no" pInputText [(ngModel)]="selectedVendor.vat_gst_no" (ngModelChange)="onFieldChange('vat_gst_no', vatGstInput.value)" (blur)="onFieldBlur('vat_gst_no')" required />
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('vat_gst_no')">{{ getFieldError('vat_gst_no') }}</small>
            </div>
            <div class="grid-item">
              <label>Place of Supply</label>
              <p-dropdown [options]="placeOfSupplyOptions" [(ngModel)]="selectedVendor.place_of_supply" optionLabel="label" optionValue="value" placeholder="Select Place of Supply"></p-dropdown>
            </div>
            <div class="grid-item">
              <label>PAN No.</label>
              <input pInputText [(ngModel)]="selectedVendor.pan_no" />
            </div>
            <div class="grid-item">
              <label>TAN No.</label>
              <input pInputText [(ngModel)]="selectedVendor.tan_no" />
            </div>
          </div>
          <!-- Contact -->
          <div class="section-header">Contact</div>
          <p-table [value]="selectedVendor.contacts" [showGridlines]="true" [responsiveLayout]="'scroll'">
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
          <button pButton label="{{ selectedVendor?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()" [disabled]="!isFormValid()"></button>
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
export class VendorComponent implements OnInit {
  vendors: Vendor[] = [];
  vendorTypeOptions: any[] = [];
  blockedOptions = [
    { label: 'Recieve', value: 'Recieve' },
    { label: 'All', value: 'All'}
  ];
  countryOptions: any[] = [];
  stateOptions: any[] = [];
  cityOptions: any[] = [];
  billToVendorOptions: any[] = [];
  placeOfSupplyOptions: any[] = [];
  mappedVendorSeriesCode: string | null = null;
  isManualSeries: boolean = false;
  isDialogVisible = false;
  selectedVendor: (Vendor & { isNew?: boolean }) | null = null;
  allLocations: MasterLocation[] = [];
  fieldErrors: { [key: string]: string } = {};
  touchedFields: { [key: string]: boolean } = {};
  


  constructor(
    private vendorService: VendorService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private messageService: MessageService,
    private masterLocationService: MasterLocationService,
    private masterTypeService: MasterTypeService
  ) {}

  ngOnInit() {
    this.loadOptions();
    this.loadMappedVendorSeriesCode();
  }

  loadOptions() {
    // Load vendor type options from master type where key === 'Vendor' and status === 'Active'
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        this.vendorTypeOptions = (types || [])
          .filter(t => t.key === 'Vendor' && t.status === 'Active')
          .map(t => ({ label: t.value, value: t.value }));
        console.log('Vendor type options loaded:', this.vendorTypeOptions);
      },
      error: (error) => {
        console.error('Error loading vendor types:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load vendor types' });
      }
    });
    
    // Load existing vendors for bill-to vendor dropdown
    this.refreshList();
    
    // Load locations for country, state, city dropdowns
    this.loadLocations();
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refreshList() {
    this.vendorService.getAll().subscribe({
      next: (data) => {
        this.vendors = data;
        this.billToVendorOptions = data.map(c => ({
          label: `${c.vendor_no} - ${c.name}`,
          value: `${c.vendor_no} - ${c.name}`
        }));
        console.log('Vendors loaded:', this.vendors.length);
      },
      error: (error) => {
        console.error('Error loading vendors:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load vendors' });
      }
    });
  }

  loadMappedVendorSeriesCode() {
    this.mappingService.getMapping().subscribe({
      next: (mapping) => {
        this.mappedVendorSeriesCode = mapping.vendorCode;
        if (this.mappedVendorSeriesCode) {
          this.numberSeriesService.getAll().subscribe({
            next: (seriesList) => {
              const found = seriesList.find((s: any) => s.code === this.mappedVendorSeriesCode);
              this.isManualSeries = !!(found && found.is_manual);
              console.log('Vendor series code mapped:', this.mappedVendorSeriesCode, 'Manual:', this.isManualSeries);
            },
            error: (error) => {
              console.error('Error loading number series:', error);
            }
          });
        } else {
          this.isManualSeries = false;
          console.log('No vendor series code mapped');
        }
      },
      error: (error) => {
        console.error('Error loading mapping:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load mapping configuration' });
      }
    });
  }

  addRow() {
    this.selectedVendor = {
      vendor_no: '',
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
      bill_to_vendor_name: '',
      vat_gst_no: '',
      place_of_supply: '',
      pan_no: '',
      tan_no: '',
      contacts: [],
      isNew: true
    };
    this.isDialogVisible = true;
    this.updateBillToVendorNameDefault();
  }

  updateBillToVendorNameDefault() {
    if (this.selectedVendor) {
      let no = this.selectedVendor.vendor_no;
      if (!this.isManualSeries) {
        no = '(auto)';
      }
      const liveValue = `${no || ''} - ${this.selectedVendor.name || ''}`.trim();
      if (
        !this.selectedVendor.bill_to_vendor_name ||
        (Array.isArray(this.billToVendorOptions) && this.billToVendorOptions.every(opt => opt.value !== this.selectedVendor!.bill_to_vendor_name))
      ) {
        this.selectedVendor.bill_to_vendor_name = liveValue;
      }
    }
  }

  editRow(vendor: Vendor) {
    this.selectedVendor = { ...vendor, isNew: false };
    // Always set Bill-to Vendor Name to the real value on edit
    if (this.selectedVendor.vendor_no && this.selectedVendor.name) {
      this.selectedVendor.bill_to_vendor_name = `${this.selectedVendor.vendor_no} - ${this.selectedVendor.name}`;
    }
    this.isDialogVisible = true;
  }

  saveRow() {
    if (!this.selectedVendor) return;
    
    if (!this.validateForm()) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Please fix the validation errors before saving' 
      });
      return;
    }
    
    const payload: any = {
      ...this.selectedVendor,
      seriesCode: this.mappedVendorSeriesCode // Always use mapped code
    };
    if (!this.isManualSeries) {
      payload.vendor_no = undefined; // Let backend generate
    }
    const req = this.selectedVendor.isNew
      ? this.vendorService.create(payload)
      : this.vendorService.update(this.selectedVendor.id!, this.selectedVendor);
    req.subscribe({
      next: (createdVendor) => {
        // Update Bill-to Vendor Name with the real number after save
        if (createdVendor && createdVendor.vendor_no && createdVendor.name) {
          this.selectedVendor!.bill_to_vendor_name = `${createdVendor.vendor_no} - ${createdVendor.name}`;
        }
        const msg = this.selectedVendor?.isNew ? 'Vendor created' : 'Vendor updated';
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
    this.selectedVendor = null;
    this.fieldErrors = {};
    this.touchedFields = {};
  }

  addContact() {
    if (this.selectedVendor) {
      this.selectedVendor.contacts.push({ name: '', department: '', mobile: '', landline: '', email: '', remarks: '' });
    }
  }

  removeContact(index: number) {
    if (this.selectedVendor) {
      this.selectedVendor.contacts.splice(index, 1);
    }
  }

  clear(table: any) {
    table.clear();
  }

  loadLocations() {
    this.masterLocationService.getAll().subscribe({
      next: (locations) => {
        this.allLocations = locations.filter(l => l.active);
        // Unique countries - show ALL active locations regardless of type
        this.countryOptions = uniqueCaseInsensitive(this.allLocations.map(l => l.country))
          .map(c => ({ label: toTitleCase(c), value: c }));
        // Reset state and city options
        this.stateOptions = [];
        this.cityOptions = [];
        // Place of Supply: GST_LOCATION type, format 'gst_state_code-name'
        const gstLocations = this.allLocations.filter(l => l.type === 'GST_LOCATION');
        this.placeOfSupplyOptions = uniqueCaseInsensitive(gstLocations.map(l => `${l.gst_state_code}-${l.name}`))
          .map(val => ({ label: val, value: val }));
        console.log('Locations loaded:', this.allLocations.length);
        console.log('Countries loaded:', this.countryOptions.length);
        console.log('Place of supply options loaded:', this.placeOfSupplyOptions.length);
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load locations' });
      }
    });
  }

  onCountryChange() {
    if (!this.selectedVendor || !this.selectedVendor.country) {
      this.stateOptions = [];
      this.cityOptions = [];
      if (this.selectedVendor) {
        this.selectedVendor.state = '';
        this.selectedVendor.city = '';
      }
      return;
    }
    
    console.log('Selected country:', this.selectedVendor.country);
    console.log('All locations for debugging:', this.allLocations);
    
    // Show ALL states for the selected country regardless of location type (case-insensitive)
    const matchingLocations = this.allLocations.filter(l => 
      l.country && l.country.toLowerCase() === this.selectedVendor!.country.toLowerCase()
    );
    console.log('Matching locations for country:', matchingLocations);
    
    const states = matchingLocations
      .map(l => l.state)
      .filter(Boolean);
    console.log('All states found:', states);
    
    this.stateOptions = uniqueCaseInsensitive(states).map(s => ({ label: toTitleCase(s), value: s }));
    console.log('Final state options:', this.stateOptions);
    
    this.cityOptions = [];
    this.selectedVendor.state = '';
    this.selectedVendor.city = '';
  }

  onStateChange() {
    if (!this.selectedVendor || !this.selectedVendor.state) {
      this.cityOptions = [];
      if (this.selectedVendor) {
        this.selectedVendor.city = '';
      }
      return;
    }
    // Show ALL cities for the selected country and state regardless of location type (case-insensitive)
    const cities = this.allLocations
      .filter(l => 
        l.country && l.country.toLowerCase() === this.selectedVendor!.country.toLowerCase() &&
        l.state && l.state.toLowerCase() === this.selectedVendor!.state.toLowerCase()
      )
      .map(l => l.city)
      .filter(Boolean);
    this.cityOptions = uniqueCaseInsensitive(cities).map(c => ({ label: toTitleCase(c), value: c }));
    this.selectedVendor.city = '';
  }

  // Validation methods
  validateField(field: string, value: any): string {
    switch (field) {
      case 'vendor_no':
        if (!value || value.trim() === '') return 'Vendor No. is required';
        break;
      case 'type':
        if (!value || value.trim() === '') return 'Vendor Type is required';
        break;
      case 'name':
        if (!value || value.trim() === '') return 'Vendor Name is required';
        break;
      case 'country':
        if (!value || value.trim() === '') return 'Country is required';
        break;
      case 'state':
        if (!value || value.trim() === '') return 'State is required';
        break;
      case 'city':
        if (!value || value.trim() === '') return 'City is required';
        break;
      case 'vat_gst_no':
        if (!value || value.trim() === '') return 'VAT/GST No. is required';
        break;
    }
    return '';
  }

  onFieldChange(field: string, value: any) {
    // Mark field as touched when user starts typing
    this.touchedFields[field] = true;
    
    const error = this.validateField(field, value);
    if (error) {
      this.fieldErrors[field] = error;
    } else {
      delete this.fieldErrors[field];
    }
  }

  onFieldBlur(field: string) {
    // Mark field as touched when user leaves it (blur event)
    this.touchedFields[field] = true;
    
    if (!this.selectedVendor) return;
    
    const value = this.selectedVendor[field as keyof Vendor];
    const error = this.validateField(field, value);
    if (error) {
      this.fieldErrors[field] = error;
    } else {
      delete this.fieldErrors[field];
    }
  }

  getFieldError(field: string): string {
    // Only show error if field has been touched by user
    return this.touchedFields[field] ? (this.fieldErrors[field] || '') : '';
  }

  isFormValid(): boolean {
    // Only check if there are any existing errors, don't run validation
    return Object.keys(this.fieldErrors).length === 0;
  }

  validateForm(): boolean {
    if (!this.selectedVendor) return false;
    
    const requiredFields = ['vendor_no', 'type', 'name', 'country', 'state', 'city', 'vat_gst_no'];
    for (const field of requiredFields) {
      const error = this.validateField(field, this.selectedVendor[field as keyof Vendor]);
      if (error) {
        this.fieldErrors[field] = error;
        // Mark all fields as touched when form validation runs
        this.touchedFields[field] = true;
      }
    }
    
    return Object.keys(this.fieldErrors).length === 0;
  }

} 