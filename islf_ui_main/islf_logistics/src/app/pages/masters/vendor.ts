import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VendorService, Vendor, VendorContact } from '../../services/vendor.service';
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
  selector: 'vendor-master',
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
    DialogModule,
    ConfirmDialogModule
  ],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
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
              <label for="state">State / Province <span class="text-red-500">*</span></label>
              <p-dropdown id="state" [options]="stateOptions" [(ngModel)]="selectedVendor.state" optionLabel="label" optionValue="value" placeholder="Select State" [filter]="true" (onChange)="onStateChange(); onFieldChange('state', $event.value)" (onBlur)="onFieldBlur('state')" required></p-dropdown>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('state')">{{ getFieldError('state') }}</small>
            </div>
            <div class="grid-item">
              <label for="city">City / Town <span class="text-red-500">*</span></label>
              <p-dropdown id="city" [options]="cityOptions" [(ngModel)]="selectedVendor.city" optionLabel="label" optionValue="value" placeholder="Select City" [filter]="true" (onChange)="onFieldChange('city', $event.value)" (onBlur)="onFieldBlur('city')" required></p-dropdown>
              <small class="p-error text-red-500 text-xs ml-2" *ngIf="getFieldError('city')">{{ getFieldError('city') }}</small>
            </div>
            <div class="grid-item">
              <label>Postal Code / Zip Code</label>
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
                <td>
                  <p-dropdown [options]="departmentOptions" [(ngModel)]="contact.department" optionLabel="label" appendTo="body" optionValue="value" placeholder="Select Department" [filter]="true"></p-dropdown>
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
          
            <p-table [value]="vendorDocuments" [showGridlines]="true" [responsiveLayout]="'scroll'">
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
          <button pButton label="{{ selectedVendor?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()" [disabled]="!isFormValid()"></button>
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
          <div *ngIf="selectedDocument?.mime_type === 'application/pdf'" style="height: 100%; display: flex; flex-direction: column;">
            <!-- PDF Loading State -->
            <div *ngIf="!pdfLoaded" class="flex align-items-center justify-content-center" style="height: 100%; flex-direction: column; gap: 1rem;">
              <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #6c757d;"></i>
              <p class="text-muted">Loading PDF...</p>
              <button pButton label="Open PDF in New Tab" icon="pi pi-external-link" 
                      (click)="openDocumentInNewTab()" 
                      class="p-button-outlined"></button>
            </div>
            
            <!-- PDF Viewer -->
            <iframe *ngIf="selectedDocument?.mime_type === 'application/pdf' && safeDocumentViewerUrl && pdfLoaded" 
                    [src]="safeDocumentViewerUrl" 
                    style="width: 100%; height: 100%; border: none;"
                    (load)="onPdfLoad()"
                    (error)="onPdfError()">
            </iframe>
            
            <!-- PDF Error State -->
            <div *ngIf="pdfError" class="flex align-items-center justify-content-center" style="height: 100%; flex-direction: column; gap: 1rem;">
              <i class="pi pi-exclamation-triangle" style="font-size: 4rem; color: #dc3545;"></i>
              <h4>PDF Loading Failed</h4>
              <p class="text-muted">Unable to display PDF in browser.</p>
              <div class="flex gap-2">
                <button pButton label="Download PDF" icon="pi pi-download" 
                        (click)="downloadDocument(selectedDocument!)" 
                        class="p-button-primary"></button>
                <button pButton label="Open in New Tab" icon="pi pi-external-link" 
                        (click)="openDocumentInNewTab()" 
                        class="p-button-outlined"></button>
              </div>
            </div>
          </div>
          
          <!-- Text files -->
          <div *ngIf="selectedDocument?.mime_type === 'text/plain' && documentViewerUrl" 
               style="padding: 1rem; background: white; height: 100%; overflow: auto;">
            <pre style="margin: 0; white-space: pre-wrap; font-family: monospace;">{{ documentViewerUrl }}</pre>
          </div>
          
          <!-- Office Documents and other files - Enhanced viewer -->
          <div *ngIf="!selectedDocument?.mime_type?.startsWith('image/') && 
                      selectedDocument?.mime_type !== 'application/pdf' && 
                      selectedDocument?.mime_type !== 'text/plain' && 
                      documentViewerUrl" 
               style="height: 100%; display: flex; flex-direction: column;">
            
            <!-- Try Microsoft Office Online Viewer first -->
            <iframe *ngIf="getSafeOfficeViewerUrl()" 
                    [src]="getSafeOfficeViewerUrl()"
                    style="width: 100%; height: 100%; border: none;">
            </iframe>
            
            <!-- Fallback for unsupported files -->
            <div *ngIf="!getSafeOfficeViewerUrl()" 
                 class="flex align-items-center justify-content-center" 
                 style="height: 100%; flex-direction: column; gap: 1rem;">
              <i class="pi pi-file" style="font-size: 4rem; color: #6c757d;"></i>
              <h4>Document Preview</h4>
              <p class="text-muted">This file type requires download for viewing.</p>
              <button pButton label="Download File" icon="pi pi-download" 
                      (click)="downloadDocument(selectedDocument!)" 
                      class="p-button-primary"></button>
            </div>
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
  vendorDocuments: (EntityDocument & { file?: File })[] = [];
  documentUploadPath: string = '/uploads/documents/vendor';
  documentTypeOptions: any[] = [];
  departmentOptions: any[] = [];
  
  // Document viewer dialog
  isDocumentViewerVisible = false;
  selectedDocument: EntityDocument | null = null;
  documentViewerUrl: string = '';
  safeDocumentViewerUrl: SafeResourceUrl | null = null;
  pdfLoaded: boolean = false;
  pdfError: boolean = false;
  


  constructor(
    private vendorService: VendorService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private masterLocationService: MasterLocationService,
    private masterTypeService: MasterTypeService,
    private entityDocumentService: EntityDocumentService,
    private departmentService: DepartmentService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadOptions();
    this.loadMappedVendorSeriesCode();
    this.loadDocumentUploadPath();
    this.loadDocumentTypeOptions();
    this.loadDepartmentOptions();
  }

  loadOptions() {
    // Load vendor type options from master type where key === 'Vendor' and status === 'Active'
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        this.vendorTypeOptions = (types || [])
          .filter(t => t.key === 'VENDOR' && t.status === 'Active')
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
    // Load vendor documents
    if (vendor.id) {
      this.loadVendorDocuments(vendor.vendor_no);
    }
  }

  async saveRow() {
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

    try {
      let savedVendor;
      if (this.selectedVendor.isNew) {
        savedVendor = await this.vendorService.create(payload).toPromise();
      } else {
        savedVendor = await this.vendorService.update(this.selectedVendor.id!, this.selectedVendor).toPromise();
      }

      // Update Bill-to Vendor Name with the real number after save
      if (savedVendor && savedVendor.vendor_no && savedVendor.name) {
        this.selectedVendor!.bill_to_vendor_name = `${savedVendor.vendor_no} - ${savedVendor.name}`;
      }
      const msg = this.selectedVendor?.isNew ? 'Vendor created' : 'Vendor updated';
      this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });

      // Save documents if vendor was created/updated successfully
      if (savedVendor && savedVendor.vendor_no) {
        await this.saveDocuments(savedVendor);
      }

      this.refreshList();
      this.hideDialog();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed' });
    }
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedVendor = null;
    this.fieldErrors = {};
    this.touchedFields = {};
    this.vendorDocuments = [];
  }

  addContact() {
    if (this.selectedVendor) {
      this.selectedVendor.contacts.push({ name: '', department: '', mobile: '', landline: '', email: '', remarks: '' });
    }
  }

  removeContact(index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this contact?',
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.selectedVendor) {
          this.selectedVendor.contacts.splice(index, 1);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Contact removed successfully' });
        }
      }
    });
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

  // Document handling methods
  loadDocumentUploadPath() {
    console.log('Loading document upload path for vendor...');
    this.entityDocumentService.getUploadPath('vendor').subscribe({
      next: (response: any) => {
        console.log('Document upload path loaded:', response.value);
        this.documentUploadPath = response.value;
      },
      error: (error: any) => {
        console.error('Error loading document upload path:', error);
        this.documentUploadPath = '/uploads/documents/vendor';
      }
    });
  }

  loadDocumentTypeOptions() {
    this.masterTypeService.getAll().subscribe({
      next: (types: any[]) => {
        this.documentTypeOptions = (types || [])
          .filter(t => t.key === 'VEN_DOCUMENT' && t.status === 'Active')
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
    // Hardcoded department options
    this.departmentOptions = [
      {
        label: 'Sales',
        value: 'Sales',
      },
      {
        label: 'Documentation',
        value: 'Documentation',
      },
      {
        label: 'Customer Service',
        value: 'Customer Service',
      },
      {
        label: 'Operation',
        value: 'Operation',
      },
      {
        label: 'Accounts',
        value: 'Accounts',
      }
    ];
    console.log('Department options loaded:', this.departmentOptions);
  }

  addDocument() {
    this.vendorDocuments.push({
      entity_type: 'vendor',
      entity_code: this.selectedVendor!.vendor_no,
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
    const document = this.vendorDocuments[index];
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this document?',
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (document.id) {
          // Delete from server if it exists
          this.entityDocumentService.delete(document.id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Document deleted' });
              this.vendorDocuments.splice(index, 1);
            },
            error: (error: any) => {
              console.error('Error deleting document:', error);
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete document' });
            }
          });
        } else {
          // Just remove from local array if not saved yet
          this.vendorDocuments.splice(index, 1);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Document removed' });
        }
      }
    });
  }

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.vendorDocuments[index].file = file;
      this.vendorDocuments[index].file_name = file.name;
      this.vendorDocuments[index].file_size = file.size;
      this.vendorDocuments[index].mime_type = file.type;
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
    this.pdfLoaded = false;
    this.pdfError = false;
    
    // Always load fresh from server - no caching for blob URLs
    this.entityDocumentService.view(doc.id).subscribe({
      next: (blob: any) => {
        console.log('View successful, blob size:', blob.size);
        console.log('Blob type:', blob.type);
        
        this.documentViewerUrl = window.URL.createObjectURL(blob);
        this.safeDocumentViewerUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.documentViewerUrl);
        
        console.log('Document viewer URL created:', this.documentViewerUrl);
        
        // Immediate load for PDFs
        if (doc.mime_type === 'application/pdf') {
          this.pdfLoaded = true;
        } else {
          // Short delay for other file types
          setTimeout(() => {
            this.pdfLoaded = true;
          }, 300);
        }
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
    this.safeDocumentViewerUrl = null;
    this.pdfLoaded = false;
    this.pdfError = false;
  }

  getOfficeViewerUrl(): string {
    if (!this.documentViewerUrl || !this.selectedDocument) return '';
    
    // Check if it's a blob URL
    if (this.documentViewerUrl.startsWith('blob:')) {
      // For blob URLs, we can't use online viewers directly
      // We'll return empty to show the fallback
      return '';
    }
    
    // For regular URLs, try Microsoft Office Online Viewer
    const encodedUrl = encodeURIComponent(this.documentViewerUrl);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  }

  getSafeOfficeViewerUrl(): SafeResourceUrl | null {
    const url = this.getOfficeViewerUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  }

  openDocumentInNewTab() {
    if (this.selectedDocument?.id) {
      // Use the server URL instead of blob URL for better compatibility
      const serverUrl = `${window.location.origin}/api/entity-documents/${this.selectedDocument.id}/view`;
      window.open(serverUrl, '_blank');
    }
  }

  onPdfLoad() {
    console.log('PDF loaded successfully');
    this.pdfLoaded = true;
    this.pdfError = false;
  }

  onPdfError() {
    console.log('PDF failed to load');
    this.pdfError = true;
    this.pdfLoaded = false;
  }



  loadVendorDocuments(vendorNo: string) {
    this.entityDocumentService.getByEntityCode('vendor', vendorNo).subscribe({
      next: (documents: any) => {
        this.vendorDocuments = documents;
      },
      error: (error: any) => {
        console.error('Error loading vendor documents:', error);
        this.vendorDocuments = [];
      }
    });
  }

  async saveDocuments(vendorData?: any) {
    const vendor = vendorData || this.selectedVendor;
    if (!vendor?.vendor_no) return;

    // Filter out documents without doc_type selected
    const documentsToUpload = this.vendorDocuments.filter(doc => doc.file && !doc.id && doc.doc_type);
    const documentsWithoutDocType = this.vendorDocuments.filter(doc => doc.file && !doc.id && !doc.doc_type);
    
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
          entity_type: 'vendor',
          entity_code: vendor.vendor_no,
          entity_name: vendor.name, // Include vendor name for folder creation
          doc_type: doc.doc_type,
          document_number: doc.document_number || '',
          valid_from: doc.valid_from || '',
          valid_till: doc.valid_till || '',
          file_name: doc.file?.name,
          uploadPath: this.documentUploadPath
        });

        const formData = new FormData();
        formData.append('entity_type', 'vendor');
        formData.append('entity_code', vendor.vendor_no);
        formData.append('entity_name', vendor.name); // Include vendor name for folder creation
        formData.append('doc_type', doc.doc_type);
        formData.append('document_number', doc.document_number || '');
        formData.append('valid_from', doc.valid_from || '');
        formData.append('valid_till', doc.valid_till || '');
        formData.append('document', doc.file!);
        formData.append('uploadPath', this.documentUploadPath);

        return this.entityDocumentService.uploadDocument(formData).toPromise();
      });

    const updatePromises = this.vendorDocuments
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
    this.loadVendorDocuments(vendor.vendor_no);
  }

} 