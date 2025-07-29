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
import { EntityDocumentService, EntityDocument } from '../../services/entity-document.service';
import { DepartmentService } from '../../services/department.service';

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
              <label for="customer_no">Customer No. </label>
              <input #customerNoInput id="customer_no" pInputText [(ngModel)]="selectedCustomer.customer_no" [disabled]="!isManualSeries || !selectedCustomer.isNew" (ngModelChange)="updateBillToCustomerNameDefault(); onFieldChange('customer_no', customerNoInput.value)" (blur)="onFieldBlur('customer_no')" required />
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('customer_no')">{{ getFieldError('customer_no') }}</small>
            </div>
            <div class="grid-item">
              <label for="type">Customer Type <span class="text-red-500">*</span></label>
              <p-dropdown id="type" [options]="customerTypeOptions" [(ngModel)]="selectedCustomer.type" optionLabel="label" optionValue="value" placeholder="Select Customer Type" (onChange)="onFieldChange('type', $event.value)" (onBlur)="onFieldBlur('type')" required></p-dropdown>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('type')">{{ getFieldError('type') }}</small>
            </div>
            <div class="grid-item">
              <label for="name">Name <span class="text-red-500">*</span></label>
              <input #nameInput id="name" pInputText [(ngModel)]="selectedCustomer.name" (ngModelChange)="updateBillToCustomerNameDefault(); onFieldChange('name', nameInput.value)" (blur)="onFieldBlur('name')" required />
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('name')">{{ getFieldError('name') }}</small>
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
              <label for="country">Country <span class="text-red-500">*</span></label>
              <p-dropdown id="country" [options]="countryOptions" [(ngModel)]="selectedCustomer.country" optionLabel="label" optionValue="value" placeholder="Select Country" [filter]="true" (onChange)="onCountryChange(); onFieldChange('country', $event.value)" (onBlur)="onFieldBlur('country')" required></p-dropdown>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('country')">{{ getFieldError('country') }}</small>
            </div>
            <div class="grid-item">
              <label for="state">State <span class="text-red-500">*</span></label>
              <p-dropdown id="state" [options]="stateOptions" [(ngModel)]="selectedCustomer.state" optionLabel="label" optionValue="value" placeholder="Select State" [filter]="true" (onChange)="onStateChange(); onFieldChange('state', $event.value)" (onBlur)="onFieldBlur('state')" required></p-dropdown>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('state')">{{ getFieldError('state') }}</small>
            </div>
            <div class="grid-item">
              <label for="city">City <span class="text-red-500">*</span></label>
              <p-dropdown id="city" [options]="cityOptions" [(ngModel)]="selectedCustomer.city" optionLabel="label" optionValue="value" placeholder="Select City" [filter]="true" (onChange)="onFieldChange('city', $event.value)" (onBlur)="onFieldBlur('city')" required></p-dropdown>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('city')">{{ getFieldError('city') }}</small>
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
              <label for="vat_gst_no">VAT/GST No. <span class="text-red-500">*</span></label>
              <input #vatGstInput id="vat_gst_no" pInputText [(ngModel)]="selectedCustomer.vat_gst_no" (ngModelChange)="onFieldChange('vat_gst_no', vatGstInput.value)" (blur)="onFieldBlur('vat_gst_no')" required />
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('vat_gst_no')">{{ getFieldError('vat_gst_no') }}</small>
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
                <td>
                  <p-dropdown [options]="departmentOptions" [(ngModel)]="contact.department" optionLabel="label" optionValue="value" placeholder="Select Department" [filter]="true"></p-dropdown>
                </td>
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
          
          <!-- Document Upload -->
          <div class="section-header">Document Upload</div>
          <div class="document-upload-section">
          
            <p-table [value]="customerDocuments" [showGridlines]="true" [responsiveLayout]="'scroll'">
              <ng-template pTemplate="header">
                <tr>
                  <th>DOC. TYPE</th>
                  <th>DOCUMENT NUMBER</th>
                  <th>VALID FROM</th>
                  <th>VALID TILL</th>
                  <th>FILE</th>
                  <th>Action</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-document let-rowIndex="rowIndex">
                <tr>
                  <td>
                    <p-dropdown [options]="documentTypeOptions" [(ngModel)]="document.doc_type" optionLabel="label" optionValue="value" placeholder="Select Document Type"></p-dropdown>
                  </td>
                  <td>
                    <input pInputText [(ngModel)]="document.document_number" placeholder="Document Number" />
                  </td>
                  <td>
                    <input pInputText type="date" [(ngModel)]="document.valid_from" />
                  </td>
                  <td>
                    <input pInputText type="date" [(ngModel)]="document.valid_till" />
                  </td>
                  <td>
                    <input type="file" (change)="onFileSelected($event, rowIndex)" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt" class="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"/>
                    <small *ngIf="document.file_name" class="text-gray-600">{{ document.file_name }}</small>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button pButton icon="pi pi-eye" class="p-button-sm p-button-outlined" (click)="viewDocument(document)" *ngIf="document.id" pTooltip="View Document"></button>
                      <button pButton icon="pi pi-download" class="p-button-sm p-button-outlined" (click)="downloadDocument(document)" *ngIf="document.id" pTooltip="Download Document"></button>
                      <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeDocument(rowIndex)" pTooltip="Delete Document"></button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="footer">
                <tr>
                  <td colspan="6">
                    <button pButton label="Add Document" icon="pi pi-plus" (click)="addDocument()"></button>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="hideDialog()"></button>
          <button pButton label="{{ selectedCustomer?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()" [disabled]="!isFormValid()"></button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Document Viewer Dialog -->
    <p-dialog 
      [(visible)]="isDocumentViewerVisible" 
      [modal]="true" 
      [style]="{width: '90vw', height: '90vh'}" 
      [maximizable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDocumentViewer()">
      
      <ng-template pTemplate="header">
        <div class="flex align-items-center justify-content-between w-full">
          <h5 class="m-0">
            <i class="pi pi-file mr-2"></i>
            {{ selectedDocument?.file_name }}
          </h5>
          <div class="flex gap-2">
            <button pButton icon="pi pi-download" class="p-button-sm p-button-outlined" 
                    (click)="downloadDocument(selectedDocument!)" 
                    pTooltip="Download Document"></button>
            <button pButton icon="pi pi-times" class="p-button-sm p-button-outlined" 
                    (click)="hideDocumentViewer()" 
                    pTooltip="Close"></button>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="content">
        <div class="document-viewer-container" style="height: calc(90vh - 120px); overflow: auto;">
          <!-- Image files -->
          <img *ngIf="selectedDocument?.mime_type?.startsWith('image/') && documentViewerUrl" 
               [src]="documentViewerUrl" 
               [alt]="selectedDocument?.file_name"
               style="max-width: 100%; max-height: 100%; object-fit: contain;">
          
          <!-- PDF files -->
          <iframe *ngIf="selectedDocument?.mime_type === 'application/pdf' && documentViewerUrl" 
                  [src]="documentViewerUrl" 
                  style="width: 100%; height: 100%; border: none;">
          </iframe>
          
          <!-- Text files -->
          <div *ngIf="selectedDocument?.mime_type === 'text/plain' && documentViewerUrl" 
               style="padding: 1rem; background: white; height: 100%; overflow: auto;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: monospace;">{{ documentViewerUrl }}</pre>
          </div>
          
          <!-- Other file types - show download prompt -->
          <div *ngIf="!selectedDocument?.mime_type?.startsWith('image/') && selectedDocument?.mime_type !== 'application/pdf' && selectedDocument?.mime_type !== 'text/plain'" 
               class="flex align-items-center justify-content-center" 
               style="height: 100%; flex-direction: column; gap: 1rem;">
            <i class="pi pi-file" style="font-size: 4rem; color: #6c757d;"></i>
            <h4>File Preview Not Available</h4>
            <p class="text-muted">This file type cannot be previewed in the browser.</p>
            <button pButton label="Download File" icon="pi pi-download" 
                    (click)="downloadDocument(selectedDocument!)" 
                    class="p-button-primary"></button>
          </div>
          
          <!-- Loading state -->
          <div *ngIf="!documentViewerUrl" 
               class="flex align-items-center justify-content-center" 
               style="height: 100%;">
            <div class="text-center">
              <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6c757d;"></i>
              <p class="mt-2 text-muted">Loading document...</p>
            </div>
          </div>
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
    .document-upload-section {
      margin-top: 1rem;
    }
    .document-header {
      background-color: #f8f9fa;
      padding: 0.75rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
    }
    .document-header h4 {
      margin: 0;
      font-weight: bold;
      color: #374151;
    }
    .flex {
      display: flex;
    }
    .gap-1 {
      gap: 0.25rem;
    }
    .text-gray-600 {
      color: #6b7280;
    }
    .text-xs {
      font-size: 0.75rem;
    }
    .ml-2 {
      margin-left: 0.5rem;
    }
  `]
})
export class CustomerComponent implements OnInit {
  customers: Customer[] = [];
  customerTypeOptions: any[] = [];
  blockedOptions = [
    { label: 'Ship', value: 'Ship' },
    { label: 'All', value: 'All' }
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
  fieldErrors: { [key: string]: string } = {};
  touchedFields: { [key: string]: boolean } = {};
  customerDocuments: (EntityDocument & { file?: File })[] = [];
  documentUploadPath: string = '/uploads/documents/customer';
  documentTypeOptions: any[] = [];
  departmentOptions: any[] = [];
  
  // Document viewer dialog
  isDocumentViewerVisible = false;
  selectedDocument: EntityDocument | null = null;
  documentViewerUrl: string = '';
  


  constructor(
    private customerService: CustomerService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private messageService: MessageService,
    private masterLocationService: MasterLocationService,
    private masterTypeService: MasterTypeService,
    private entityDocumentService: EntityDocumentService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    this.loadOptions();
    this.loadMappedCustomerSeriesCode();
    this.loadDocumentUploadPath();
    this.loadDocumentTypeOptions();
    this.loadDepartmentOptions();
  }

  loadOptions() {
    // Load customer type options from master type where key === 'Customer' and status === 'Active'
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        this.customerTypeOptions = (types || [])
          .filter(t => t.key === 'Customer' && t.status === 'Active')
          .map(t => ({ label: t.value, value: t.value }));
        console.log('Customer type options loaded:', this.customerTypeOptions);
      },
      error: (error) => {
        console.error('Error loading customer types:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load customer types' });
      }
    });
    
    // Load existing customers for bill-to customer dropdown
    this.refreshList();
    
    // Load locations for country, state, city dropdowns
    this.loadLocations();
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refreshList() {
    this.customerService.getAll().subscribe({
      next: (data) => {
        this.customers = data;
        this.billToCustomerOptions = data.map(c => ({
          label: `${c.customer_no} - ${c.name}`,
          value: `${c.customer_no} - ${c.name}`
        }));
        console.log('Customers loaded:', this.customers.length);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load customers' });
      }
    });
  }

  loadMappedCustomerSeriesCode() {
    this.mappingService.getMapping().subscribe({
      next: (mapping) => {
        this.mappedCustomerSeriesCode = mapping.customerCode;
        if (this.mappedCustomerSeriesCode) {
          this.numberSeriesService.getAll().subscribe({
            next: (seriesList) => {
              const found = seriesList.find((s: any) => s.code === this.mappedCustomerSeriesCode);
              this.isManualSeries = !!(found && found.is_manual);
              console.log('Customer series code mapped:', this.mappedCustomerSeriesCode, 'Manual:', this.isManualSeries);
            },
            error: (error) => {
              console.error('Error loading number series:', error);
            }
          });
        } else {
          this.isManualSeries = false;
          console.log('No customer series code mapped');
        }
      },
      error: (error) => {
        console.error('Error loading mapping:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load mapping configuration' });
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
    // Load customer documents
    if (customer.id) {
      this.loadCustomerDocuments(customer.customer_no);
    }
  }

  async saveRow() {
    if (!this.selectedCustomer) return;

    if (!this.validateForm()) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Please fix the validation errors before saving' 
      });
      return;
    }

    const payload: any = {
      ...this.selectedCustomer,
      seriesCode: this.mappedCustomerSeriesCode // Always use mapped code
    };
    if (!this.isManualSeries) {
      payload.customer_no = undefined; // Let backend generate
    }

    try {
      let savedCustomer;
      if (this.selectedCustomer.isNew) {
        savedCustomer = await this.customerService.create(payload).toPromise();
      } else {
        savedCustomer = await this.customerService.update(this.selectedCustomer.id!, this.selectedCustomer).toPromise();
      }

      // Update Bill-to Customer Name with the real number after save
      if (savedCustomer && savedCustomer.customer_no && savedCustomer.name) {
        this.selectedCustomer!.bill_to_customer_name = `${savedCustomer.customer_no} - ${savedCustomer.name}`;
      }
      const msg = this.selectedCustomer?.isNew ? 'Customer created' : 'Customer updated';
      this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });

      // Save documents if customer was created/updated successfully
      if (savedCustomer && savedCustomer.customer_no) {
        await this.saveDocuments(savedCustomer);
      }

      this.refreshList();
      this.hideDialog();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed' });
    }
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedCustomer = null;
    this.fieldErrors = {};
    this.touchedFields = {};
    this.customerDocuments = [];
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
    if (!this.selectedCustomer || !this.selectedCustomer.country) {
      this.stateOptions = [];
      this.cityOptions = [];
      if (this.selectedCustomer) {
        this.selectedCustomer.state = '';
        this.selectedCustomer.city = '';
      }
      return;
    }
    
    console.log('Selected country:', this.selectedCustomer.country);
    console.log('All locations for debugging:', this.allLocations);
    
    // Show ALL states for the selected country regardless of location type (case-insensitive)
    const matchingLocations = this.allLocations.filter(l => 
      l.country && l.country.toLowerCase() === this.selectedCustomer!.country.toLowerCase()
    );
    console.log('Matching locations for country:', matchingLocations);
    
    const states = matchingLocations
      .map(l => l.state)
      .filter(Boolean);
    console.log('All states found:', states);
    
    this.stateOptions = uniqueCaseInsensitive(states).map(s => ({ label: toTitleCase(s), value: s }));
    console.log('Final state options:', this.stateOptions);
    
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
    // Show ALL cities for the selected country and state regardless of location type (case-insensitive)
    const cities = this.allLocations
      .filter(l => 
        l.country && l.country.toLowerCase() === this.selectedCustomer!.country.toLowerCase() &&
        l.state && l.state.toLowerCase() === this.selectedCustomer!.state.toLowerCase()
      )
      .map(l => l.city)
      .filter(Boolean);
    this.cityOptions = uniqueCaseInsensitive(cities).map(c => ({ label: toTitleCase(c), value: c }));
    this.selectedCustomer.city = '';
  }

  // Validation methods
  validateField(field: string, value: any): string {
    switch (field) {
      case 'customer_no':
        if (!value || value.trim() === '') return 'Customer No. is required';
        break;
      case 'type':
        if (!value || value.trim() === '') return 'Customer Type is required';
        break;
      case 'name':
        if (!value || value.trim() === '') return 'Customer Name is required';
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
    
    if (!this.selectedCustomer) return;
    
    const value = this.selectedCustomer[field as keyof Customer];
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
    if (!this.selectedCustomer) return false;
    
    const requiredFields = [ 'type', 'name', 'country', 'state', 'city', 'vat_gst_no'];
    for (const field of requiredFields) {
      const error = this.validateField(field, this.selectedCustomer[field as keyof Customer]);
      if (error) {
        this.fieldErrors[field] = error;
        // Mark all fields as touched when form validation runs
        this.touchedFields[field] = true;
      }
    }
    
    return Object.keys(this.fieldErrors).length === 0;
  }

  // Document handling methods
  loadDocumentUploadPath() {
    console.log('Loading document upload path for customer...');
    this.entityDocumentService.getUploadPath('customer').subscribe({
      next: (response: any) => {
        console.log('Document upload path loaded:', response.value);
        this.documentUploadPath = response.value;
      },
      error: (error: any) => {
        console.error('Error loading document upload path:', error);
        this.documentUploadPath = '/uploads/documents/customer';
      }
    });
  }

  loadDocumentTypeOptions() {
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        this.documentTypeOptions = (types || [])
          .filter(t => t.key === 'Cus_document' && t.status === 'Active')
          .map(t => ({ label: t.value, value: t.value }));
        console.log('Document type options loaded:', this.documentTypeOptions);
      },
      error: (error) => {
        console.error('Error loading document types:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load document types' });
      }
    });
  }

  loadDepartmentOptions() {
    this.departmentService.getAll().subscribe({
      next: (departments: any[]) => {
        this.departmentOptions = (departments || [])
          .filter(d => d.status === 'Active')
          .map(d => ({ label: d.name, value: d.name }));
        console.log('Department options loaded:', this.departmentOptions);
      },
      error: (error) => {
        console.error('Error loading departments:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load departments' });
      }
    });
  }

  addDocument() {
    this.customerDocuments.push({
      entity_type: 'customer',
      entity_code: this.selectedCustomer!.customer_no,
      doc_type: '',
      document_number: '',
      valid_from: '',
      valid_till: '',
      file_path: '',
      file_name: '',
      file_size: 0,
      mime_type: ''
    });
  }

  removeDocument(index: number) {
    const document = this.customerDocuments[index];
    if (document.id) {
      // Delete from server if it exists
      this.entityDocumentService.delete(document.id).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Document deleted' });
          this.customerDocuments.splice(index, 1);
        },
        error: (error: any) => {
          console.error('Error deleting document:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete document' });
        }
      });
    } else {
      // Just remove from local array if not saved yet
      this.customerDocuments.splice(index, 1);
    }
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.customerDocuments[index].file = file;
      this.customerDocuments[index].file_name = file.name;
      this.customerDocuments[index].file_size = file.size;
      this.customerDocuments[index].mime_type = file.type;
    }
  }

  downloadDocument(doc: EntityDocument) {
    if (!doc.id) return;
    
    console.log('=== FRONTEND DOWNLOAD REQUEST ===');
    console.log('Document ID:', doc.id);
    console.log('Document:', doc);
    
    this.entityDocumentService.download(doc.id).subscribe({
      next: (blob: any) => {
        console.log('Download successful, blob size:', blob.size);
        console.log('Blob type:', blob.type);
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.file_name;
        link.click();
        window.URL.revokeObjectURL(url);
        
        console.log('Download link clicked');
      },
      error: (error: any) => {
        console.error('Error downloading document:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to download document' });
      }
    });
  }

  viewDocument(doc: EntityDocument) {
    if (!doc.id) return;
    
    console.log('=== FRONTEND VIEW REQUEST ===');
    console.log('Document ID:', doc.id);
    console.log('Document:', doc);
    
    this.selectedDocument = doc;
    this.isDocumentViewerVisible = true;
    
    this.entityDocumentService.view(doc.id).subscribe({
      next: (blob: any) => {
        console.log('View successful, blob size:', blob.size);
        console.log('Blob type:', blob.type);
        
        this.documentViewerUrl = window.URL.createObjectURL(blob);
        console.log('Document viewer URL created:', this.documentViewerUrl);
      },
      error: (error: any) => {
        console.error('Error viewing document:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to view document' });
        this.hideDocumentViewer();
      }
    });
  }

  hideDocumentViewer() {
    this.isDocumentViewerVisible = false;
    this.selectedDocument = null;
    if (this.documentViewerUrl) {
      window.URL.revokeObjectURL(this.documentViewerUrl);
      this.documentViewerUrl = '';
    }
  }

  loadCustomerDocuments(customerNo: string) {
    this.entityDocumentService.getByEntityCode('customer', customerNo).subscribe({
      next: (documents: any) => {
        this.customerDocuments = documents;
      },
      error: (error: any) => {
        console.error('Error loading customer documents:', error);
        this.customerDocuments = [];
      }
    });
  }

  async saveDocuments(customerData?: any) {
    const customer = customerData || this.selectedCustomer;
    if (!customer?.customer_no) return;

    // Filter out documents without doc_type selected
    const documentsToUpload = this.customerDocuments.filter(doc => doc.file && !doc.id && doc.doc_type);
    const documentsWithoutDocType = this.customerDocuments.filter(doc => doc.file && !doc.id && !doc.doc_type);
    
    if (documentsWithoutDocType.length > 0) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Please select document type for all documents before saving' 
      });
      return;
    }

    const uploadPromises = documentsToUpload
      .map(doc => {
        console.log('Preparing to upload document:', {
          entity_type: 'customer',
          entity_code: customer.customer_no,
          doc_type: doc.doc_type,
          document_number: doc.document_number || '',
          valid_from: doc.valid_from || '',
          valid_till: doc.valid_till || '',
          file_name: doc.file?.name,
          uploadPath: this.documentUploadPath
        });

        const formData = new FormData();
        formData.append('entity_type', 'customer');
        formData.append('entity_code', customer.customer_no);
        formData.append('doc_type', doc.doc_type);
        formData.append('document_number', doc.document_number || '');
        formData.append('valid_from', doc.valid_from || '');
        formData.append('valid_till', doc.valid_till || '');
        formData.append('document', doc.file!);
        formData.append('uploadPath', this.documentUploadPath);

        return this.entityDocumentService.uploadDocument(formData).toPromise();
      });

    const updatePromises = this.customerDocuments
      .filter(doc => doc.id && !doc.file) // Only update existing documents without new files
      .map(doc => {
        return this.entityDocumentService.update(doc.id!, {
          doc_type: doc.doc_type,
          document_number: doc.document_number,
          valid_from: doc.valid_from,
          valid_till: doc.valid_till
        }).toPromise();
      });

    await Promise.all([...uploadPromises, ...updatePromises]);
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Documents saved successfully' });
    this.loadCustomerDocuments(customer.customer_no);
  }

} 