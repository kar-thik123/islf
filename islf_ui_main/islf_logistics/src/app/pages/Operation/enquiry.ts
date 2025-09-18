import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { MessageService, ConfirmationService } from 'primeng/api';
import { EnquiryService, Enquiry, EnquiryLineItem, EnquiryVendorCard, CustomerDropdown, CustomerContact, SourcingOption, TariffOption } from '../../services/enquiry.service';
import { ContextService } from '../../services/context.service';
import { MappingService } from '../../services/mapping.service';
import { NumberSeriesService } from '../../services/number-series.service';

@Component({
  selector: 'app-enquiry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    AutoCompleteModule,
    InputNumberModule,
    CheckboxModule,
    RadioButtonModule,
    DividerModule,
    FieldsetModule,
    PanelModule,
    AccordionModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Enquiry Management</div>

      <p-table
        #dt
        [value]="enquiries"
        dataKey="code"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['enquiry_no', 'customer_name', 'company_name', 'department', 'from_location', 'to_location', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <div class="flex gap-2">
              <button pButton type="button" label="Create Enquiry" icon="pi pi-plus" (click)="addEnquiry()"></button>
            </div>
            <div class="flex gap-2">
              <span class="p-input-icon-left">
                <i class="pi pi-search"></i>
                <input pInputText type="text" (input)="dt.filterGlobal($any($event.target).value, 'contains')" placeholder="Search..." />
              </span>
            </div>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Enquiry No
                <p-columnFilter type="text" field="enquiry_no" display="menu" placeholder="Search by enquiry no"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Date
                <p-columnFilter type="date" field="date" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Customer Name
                <p-columnFilter type="text" field="customer_name" display="menu" placeholder="Search by customer"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Company Name
                <p-columnFilter type="text" field="company_name" display="menu" placeholder="Search by company"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Department
                <p-columnFilter type="text" field="department" display="menu" placeholder="Search by department"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                From Location
                <p-columnFilter type="text" field="from_location" display="menu" placeholder="Search by from location"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                To Location
                <p-columnFilter type="text" field="to_location" display="menu" placeholder="Search by to location"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Status
                <p-columnFilter field="status" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="statusOptions"
                      (onChange)="filter($event.value)"
                      placeholder="Any"
                      styleClass="w-full"
                      optionLabel="label"
                      optionValue="value"
                    >
                      <ng-template let-option pTemplate="item">
                        <span class="font-semibold text-sm">{{ option.label }}</span>
                      </ng-template>
                    </p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th>Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-enquiry>
          <tr>
            <td>{{ enquiry.code }}</td>
            <td>{{ formatDate(enquiry.date) }}</td>
            <td>{{ enquiry.customer_name}</td>
            <td>{{ enquiry.company_name }}</td>
            <td>{{ enquiry.department }}</td> 
            <td>{{ enquiry.from_location }}</td>
            <td>{{ enquiry.to_location }}</td>
            <td>
              <span [ngClass]="getStatusClass(enquiry.status)">
                {{ enquiry.status }}
              </span>
            </td>
            <td>
              <button pButton icon="pi pi-pencil" (click)="editEnquiry(enquiry)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          Total Enquiries: {{ state.totalRecords }}
        </ng-template>
      </p-table>
    </div>

    <!-- Enhanced Enquiry Dialog -->
    <p-dialog
      header="{{ !selectedEnquiry?.code ? 'Add' : 'Edit' }} Enquiry"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      [closeOnEscape]="true"
      [style]="{ width: '1500px', height: '90vh' }"
      [contentStyle]="{ overflow: 'auto', maxHeight: '75vh' }"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedEnquiry" class="p-fluid form-grid dialog-body-padding">
          
          <!-- General Enquiry Details -->
          <div class="section-header">General Enquiry Details</div>
          <div class="grid grid-cols-12 gap-4 mb-6">
          <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Code</label>
                <input 
                  id="code"
                  pInputText 
                  [(ngModel)]="selectedEnquiry.code"
                  [placeholder]="isManualSeries ? 'Enter enquiry code' : 'Auto-generated'"
                  [readonly]="!isManualSeries"
                  [disabled]="!isManualSeries">
                <small *ngIf="fieldErrors['code']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['code'] }}</small>
              </div>  
              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Date</label>
                <p-calendar 
                  id="date"
                  [(ngModel)]="selectedEnquiry.date"
                  [showIcon]="true"
                  dateFormat="dd-mm-yy"
                  appendTo="body"
                  placeholder="Select Date"
                  [showTime]="false"
                  [timeOnly]="false">
                </p-calendar>
                <small *ngIf="fieldErrors['date']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['date'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Company Name</label>
                <p-autoComplete
                  id="company_name"
                  [(ngModel)]="selectedEnquiry.company_name"
                  [suggestions]="customerSuggestions"
                  (completeMethod)="searchCustomers($event)"
                  field="display_name"
                  placeholder="Type to search companies or enter new..."
                  [dropdown]="true"
                  (onSelect)="onCustomerSelect($event)"
                  [forceSelection]="false">
                </p-autoComplete>
                <small *ngIf="fieldErrors['company_name']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['company_name'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Name</label>
                <div *ngIf="showContactDropdown; else manualNameInput">
                  <p-dropdown
                    id="name"
                    [(ngModel)]="selectedContact"
                    [options]="customerContacts"
                    optionLabel="name"
                    placeholder="Select contact person"
                    (onChange)="onContactSelect($event)">
                    <ng-template let-contact pTemplate="item">
                      <div>
                        <div class="font-semibold">{{ contact.name }}</div>
                        <div class="text-sm text-gray-500">{{ contact.department }}</div>
                      </div>
                    </ng-template>
                  </p-dropdown>
                </div>
                <ng-template #manualNameInput>
                  <input 
                    id="name"
                    pInputText 
                    [(ngModel)]="selectedEnquiry.customer_name"
                    placeholder="Enter contact person name">
                </ng-template>
              </div>
              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Email</label>
                <input 
                  id="email"
                  pInputText 
                  [(ngModel)]="selectedEnquiry.email"
                  placeholder="Auto-filled from customer"
                  [readonly]="!isNewCustomer">
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Mobile</label>
                <input 
                  id="mobile"
                  pInputText 
                  [(ngModel)]="selectedEnquiry.mobile"
                  placeholder="Auto-filled from customer"
                  [readonly]="!isNewCustomer">
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Landline</label>
                <input 
                  id="landline"
                  pInputText 
                  [(ngModel)]="selectedEnquiry.landline"
                  placeholder="Auto-filled from customer"
                  [readonly]="!isNewCustomer">
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">From Location <span class="text-red-500">*</span></label>
                <p-autoComplete
                  id="from_location"
                  [(ngModel)]="selectedEnquiry.from_location"
                  [suggestions]="locationSuggestions"
                  (completeMethod)="searchLocations($event)"
                  field="location_name"
                  placeholder="Type to search from location..."
                  [dropdown]="true"
                  [forceSelection]="false">
                </p-autoComplete>
                <small *ngIf="fieldErrors['from_location']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['from_location'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">To Location <span class="text-red-500">*</span></label>
                <p-autoComplete
                  id="to_location"
                  [(ngModel)]="selectedEnquiry.to_location"
                  [suggestions]="locationSuggestions"
                  (completeMethod)="searchLocations($event)"
                  field="location_name"
                  placeholder="Type to search to location..."
                  [dropdown]="true"
                  [forceSelection]="false">
                </p-autoComplete>
                <small *ngIf="fieldErrors['to_location']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['to_location'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Department</label>
                <p-autoComplete
                  id="department"
                  [(ngModel)]="selectedEnquiry.department"
                  [suggestions]="departmentSuggestions"
                  (completeMethod)="searchDepartments($event)"
                  field="department_name"
                  placeholder="Type to search department..."
                  [dropdown]="true"
                  [forceSelection]="false">
                </p-autoComplete>
                <small *ngIf="fieldErrors['department']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['department'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Effective Date From</label>
                <p-calendar 
                  id="effective_date_from"
                  [(ngModel)]="selectedEnquiry.effective_date_from"
                  [showIcon]="true"
                  dateFormat="dd-mm-yy"
                  appendTo="body"
                  placeholder="Select Start Date"
                  [showTime]="false"
                  [timeOnly]="false">
                </p-calendar>
                <small *ngIf="fieldErrors['effective_date_from']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['effective_date_from'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                 <label class="block font-semibold mb-1">Effective Date To</label>
                <p-calendar 
                  id="effective_date_to"
                  [(ngModel)]="selectedEnquiry.effective_date_to"
                  [showIcon]="true"
                  dateFormat="dd-mm-yy"
                  appendTo="body"
                  placeholder="Select End Date"
                  [showTime]="false"
                  [timeOnly]="false">
                </p-calendar>
                <small *ngIf="fieldErrors['effective_date_to']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['effective_date_to'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Basis</label>
                <p-autoComplete
                  id="basis"
                  [(ngModel)]="selectedEnquiry.basis"
                  [suggestions]="basisSuggestions"
                  (completeMethod)="searchBasis($event)"
                  field="display_name"
                  placeholder="Type to search basis..."
                  [dropdown]="true"
                  [forceSelection]="false">
                </p-autoComplete>
                <small *ngIf="fieldErrors['basis']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['basis'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-6">
                <label class="block font-semibold mb-1">Remarks</label>
                <textarea 
                  id="remarks"
                  pInputTextarea 
                  [(ngModel)]="selectedEnquiry.remarks"
                  rows="3"
                  placeholder="Enter remarks">
                </textarea> 
              </div>
              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Status</label>
                <p-dropdown
                  id="status"
                  [(ngModel)]="selectedEnquiry.status"
                  [options]="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select Status">
                </p-dropdown>
              </div>
            </div>

          <!-- Line Items Section -->
          <div class="section-header">
            <h3>Line Items (Enquiry Details)</h3>
          </div>
          <div class="grid-container">
            <div class="mb-3">
              <button pButton type="button" label="Add Line Item" icon="pi pi-plus" (click)="addLineItem()" class="p-button-success p-button-sm"></button>
            </div>

            <p-table 
              [value]="lineItems" 
              [responsive]="true"
              [paginator]="false"
              styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th style="width: 80px">S.No.</th>
                  <th style="width: 150px">Quantity</th>
                  <th style="width: 150px">Basis</th>
                  <th>Remarks</th>
                  <th style="width: 120px">Status</th>
                  <th style="width: 120px">Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item let-i="rowIndex">
                <tr>
                  <td>{{ i + 1 }}</td>
                  <td>
                    <p-inputNumber
                      [(ngModel)]="item.quantity"
                      [min]="0"
                      [maxFractionDigits]="4"
                      placeholder="0.0000">
                    </p-inputNumber>
                  </td>
                  <td>
                    <input 
                      pInputText 
                      [(ngModel)]="item.basis"
                      placeholder="Basis">
                  </td>
                  <td>
                    <input 
                      pInputText 
                      [(ngModel)]="item.remarks"
                      placeholder="Remarks">
                  </td>
                  <td>
                    <p-dropdown
                      [(ngModel)]="item.status"
                      [options]="lineItemStatusOptions"
                      optionLabel="label"
                      optionValue="value">
                    </p-dropdown>
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button pButton icon="pi pi-pencil" (click)="editLineItem(i)" class="p-button-warning p-button-sm p-button-text" pTooltip="Edit Row"></button>
                      <button pButton icon="pi pi-trash" (click)="deleteLineItem(i)" class="p-button-danger p-button-sm p-button-text" pTooltip="Delete Row"></button>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="6" class="text-center py-4">No line items added yet. Click "Add Line Item" to start.</td>
                </tr>
              </ng-template>
            </p-table>

            <!-- Action Buttons -->
            <div class="flex gap-2 mt-4 pt-3 border-t">
              <button pButton type="button" label="Get Sourcing" icon="pi pi-search" (click)="getSourcing()" [disabled]="!canGetSourcing()" class="p-button-info" 
                pTooltip="Query Sourcing Table with matching conditions"></button>
              <button pButton type="button" label="Get Tariff" icon="pi pi-calculator" (click)="getTariff()" [disabled]="!canGetTariff()" class="p-button-secondary"
                pTooltip="Fetch directly from Tariff Table"></button>
            </div>
          </div>

          <!-- Vendor Cards Section -->
          <div *ngIf="vendorCards.length > 0" class="mb-4">
            <h3 class="text-lg font-semibold mb-3">Vendor Cards</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div *ngFor="let card of vendorCards; let i = index" class="vendor-card" [ngClass]="{'active-vendor': card.is_active}">
                <p-card>
                  <ng-template pTemplate="header">
                    <div class="flex justify-between items-center p-3">
                      <h4 class="font-semibold text-lg">{{ card.vendor_name }}</h4>
                      <p-radioButton 
                        [(ngModel)]="activeVendorIndex"
                        [value]="i"
                        (onChange)="onVendorActiveChange(i)"
                        label="Active">
                      </p-radioButton>
                    </div>
                  </ng-template>
                  
                  <div class="mb-2">
                    <strong>Type:</strong> {{ card.vendor_type }}
                  </div>
                  <div class="mb-2">
                    <strong>Source:</strong> {{ card.source_type | titlecase }}
                  </div>
                  
                  <!-- Charges Display -->
                  <div class="mb-3">
                    <strong>Charges:</strong>
                    <div *ngFor="let charge of getDisplayCharges(card)" class="ml-2 text-sm">
                      {{ charge.charge_type }}: {{ charge.currency }} {{ charge.amount }}
                    </div>
                  </div>

                  <ng-template pTemplate="footer">
                    <div class="flex gap-2">
                      <button pButton type="button" label="Negotiate" icon="pi pi-comments" (click)="openNegotiationDialog(card, i)" class="p-button-warning p-button-sm"></button>
                    </div>
                  </ng-template>
                </p-card>
              </div>
            </div>
          </div>

          <!-- Final Actions -->
          <div *ngIf="vendorCards.length > 0" class="border-t pt-4">
            <h3 class="text-lg font-semibold mb-3">Final Actions</h3>
            <div class="flex gap-2">
              <button pButton type="button" label="Get Mail" icon="pi pi-envelope" (click)="generateMail()" [disabled]="!canGenerateMail()" class="p-button-help"
                pTooltip="Generate Mail Template based on Active Vendor Card + Customer Details"></button>
              <button pButton type="button" label="Save" icon="pi pi-save" (click)="saveEnquiry()" class="p-button-success"
                pTooltip="Save enquiry to Enquiry Table"></button>
              <button pButton type="button" label="Confirm Enquiry" icon="pi pi-check-circle" (click)="confirmEnquiry()" [disabled]="!canConfirmEnquiry()" class="p-button-primary"
                pTooltip="Save all details into Booking Table. If customer is new, also save to Customer Table."></button>
            </div>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <div class="flex justify-between items-center p-3">
          <div class="text-sm text-gray-600">
            <span *ngIf="isNewCustomer" class="text-orange-600 font-medium">
              <i class="pi pi-info-circle mr-1"></i>
              New customer will be saved to Customer Table on Confirm Enquiry
            </span>
          </div>
          <div class="flex gap-2">
            <p-button 
              label="Cancel" 
              icon="pi pi-times" 
              [text]="true" 
              (click)="hideDialog()"
              severity="secondary"
              size="small">
            </p-button>
            <p-button 
              *ngIf="!selectedEnquiry?.code"
              label="Save Draft" 
              icon="pi pi-save" 
              (click)="saveEnquiry()"
              severity="info"
              size="small">
            </p-button>
            <p-button 
              *ngIf="selectedEnquiry?.code"
              label="Update" 
              icon="pi pi-check" 
              (click)="saveEnquiry()"
              severity="success"
              size="small">
            </p-button>
          </div>
        </div>
      </ng-template>
    </p-dialog>

      <!-- Sourcing/Tariff Selection Dialog -->
      <p-dialog 
        header="Select Vendors" 
        [(visible)]="showVendorSelectionDialog" 
        [modal]="true" 
        [style]="{width: '80vw'}"
        [maximizable]="true">
        <p-table 
          [value]="availableVendors" 
          [responsive]="true"
          [paginator]="true"
          [rows]="10"
          selectionMode="multiple"
          [(selection)]="selectedVendors"
          dataKey="id">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 3rem">
                <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
              </th>
              <th>Vendor Name</th>
              <th>Type</th>
              <th>Mode</th>
              <th>Route</th>
              <th>Basis</th>
              <th>Charges</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-vendor>
            <tr>
              <td>
                <p-tableCheckbox [value]="vendor"></p-tableCheckbox>
              </td>
              <td>{{ vendor.vendor_name }}</td>
              <td>{{ vendor.vendor_type }}</td>
              <td>{{ vendor.mode }}</td>
              <td>{{ vendor.from_location }} → {{ vendor.to_location }}</td>
              <td>{{ vendor.basis }}</td>
              <td>
                <div *ngFor="let charge of vendor.charges">
                  {{ charge.charge_type }}: {{ charge.currency }} {{ charge.amount }}
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
        
        <ng-template pTemplate="footer">
          <p-button 
            label="Cancel" 
            icon="pi pi-times" 
            (onClick)="showVendorSelectionDialog = false"
            class="p-button-text">
          </p-button>
          <p-button 
            label="Add Selected" 
            icon="pi pi-check" 
            (onClick)="addSelectedVendors()"
            [disabled]="!selectedVendors || selectedVendors.length === 0">
          </p-button>
        </ng-template>
      </p-dialog>

      <!-- Negotiation Dialog -->
      <p-dialog 
        header="Negotiate Charges" 
        [(visible)]="showNegotiationDialog" 
        [modal]="true" 
        [style]="{width: '60vw'}">
        <div *ngIf="negotiatingCard">
          <h4>{{ negotiatingCard.vendor_name }}</h4>
          <div class="grid">
            <div *ngFor="let charge of negotiationCharges; let i = index" class="col-12">
              <div class="flex align-items-center gap-3 mb-2">
                <label class="w-3">{{ charge.charge_type }}:</label>
                <p-dropdown
                  [(ngModel)]="charge.currency"
                  [options]="currencyOptions"
                  class="w-2">
                </p-dropdown>
                <p-inputNumber
                  [(ngModel)]="charge.amount"
                  [min]="0"
                  [maxFractionDigits]="2"
                  class="w-3">
                </p-inputNumber>
              </div>
            </div>
          </div>
        </div>
        
        <ng-template pTemplate="footer">
          <p-button 
            label="Cancel" 
            icon="pi pi-times" 
            (onClick)="showNegotiationDialog = false"
            class="p-button-text">
          </p-button>
          <p-button 
            label="Save Negotiation" 
            icon="pi pi-check" 
            (onClick)="saveNegotiation()">
          </p-button>
        </ng-template>
      </p-dialog>

      <!-- Mail Preview Dialog -->
      <p-dialog 
        header="Mail Preview" 
        [(visible)]="showMailDialog" 
        [modal]="true" 
        [style]="{width: '70vw'}"
        [maximizable]="true">
        <div class="mail-preview">
          <pre>{{ mailContent }}</pre>
        </div>
        
        <ng-template pTemplate="footer">
          <p-button 
            label="Close" 
            icon="pi pi-times" 
            (onClick)="showMailDialog = false"
            class="p-button-text">
          </p-button>
          <p-button 
            label="Copy to Clipboard" 
            icon="pi pi-copy" 
            (onClick)="copyMailToClipboard()">
          </p-button>
        </ng-template>
      </p-dialog>

      <!-- Toast Messages -->
      <p-toast></p-toast>
      
      <!-- Confirmation Dialog -->
      <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .vendor-card {
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }
    
    .vendor-card.active-vendor {
      border-color: #007ad9;
      box-shadow: 0 0 10px rgba(0, 122, 217, 0.3);
    }
    
    .mail-preview {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .mail-preview pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
    }
  `]
})
export class EnquiryComponent implements OnInit {
  enquiryForm!: FormGroup;
  lineItems: EnquiryLineItem[] = [];
  vendorCards: EnquiryVendorCard[] = [];
  
  // Table data
  enquiries: Enquiry[] = [];
  selectedEnquiry: Enquiry | null = null;
  isDialogVisible = false;
  fieldErrors: { [key: string]: string } = {};
  
  // Options
  statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Confirmed', value: 'Confirmed' }
  ];
  
  lineItemStatusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Pending', value: 'Pending' }
  ];

  currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'INR', value: 'INR' },
    { label: 'AED', value: 'AED' }
  ];

  // Customer autocomplete
  customerSuggestions: CustomerDropdown[] = [];
  
  // Location autocomplete
  locationSuggestions: any[] = [];

  // Department autocomplete
  departmentSuggestions: any[] = [];

  // Basis autocomplete
  basisSuggestions: any[] = [];

  // Contact management
  customerContacts: CustomerContact[] = [];
  selectedContact: CustomerContact | null = null;
  showContactDropdown = false;
  
  // Dialog states
  showVendorSelectionDialog = false;
  showNegotiationDialog = false;
  showMailDialog = false;
  
  // Vendor selection
  availableVendors: (SourcingOption | TariffOption)[] = [];
  selectedVendors: (SourcingOption | TariffOption)[] = [];
  currentVendorSource: 'sourcing' | 'tariff' = 'sourcing';
  
  // Negotiation
  negotiatingCard: EnquiryVendorCard | null = null;
  negotiatingCardIndex = -1;
  negotiationCharges: any[] = [];
  
  // Mail
  mailContent = '';
  
  // Current enquiry
  currentEnquiry: Enquiry | null = null;
  isNewCustomer = false;
  activeVendorIndex: number = -1;

  // Auto-generation properties
  mappedEnquirySeriesCode: string = '';
  isManualSeries: boolean = false;

  constructor(
    private fb: FormBuilder,
    private enquiryService: EnquiryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private contextService: ContextService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadInitialData();
    this.loadMappedEnquirySeriesCode();
  }

  initializeForm() {
    this.enquiryForm = this.fb.group({
      code: ['', Validators.required],
      date: [new Date(), Validators.required],
      customer_name: ['', Validators.required],
      email: [''],
      mobile: [''],
      landline: [''],
      company_name: [''],
      from_location: ['', Validators.required],
      to_location: ['', Validators.required],
      effective_date_from: ['', Validators.required],
      effective_date_to: ['', Validators.required],
      department: ['', Validators.required],
      basis: ['', Validators.required],
      status: ['Open', Validators.required],
      remarks: ['']
    });
  }

  loadInitialData() {
    // Load any initial data needed for dropdowns, etc.
    this.loadEnquiries();
  }

  loadEnquiries() {
    this.enquiryService.getAllEnquiries().subscribe({
      next: (enquiries: Enquiry[]) => {
        this.enquiries = enquiries;
      },
      error: (error: any) => {
        console.error('Error loading enquiries:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load enquiries'
        });
      }
    });
  }

  addEnquiry() {
    const today = new Date();
    this.selectedEnquiry = {
      id: undefined,
      enquiry_no: '',
      code: this.isManualSeries ? '' : (this.mappedEnquirySeriesCode || ''),
      date: today.toISOString().split('T')[0], // Default today's date as specified
      customer_name: '',
      company_name: '',
      email: '',
      mobile: '',
      landline: '',
      name: '',
      department: '',
      basis: '',
      from_location: '',
      to_location: '',
      effective_date_from: today.toISOString().split('T')[0],
      effective_date_to: today.toISOString().split('T')[0],
      status: 'Open',
      remarks: '',
      line_items: []
    };
    
    this.lineItems = [];
    this.vendorCards = [];
    this.activeVendorIndex = -1;
    this.isNewCustomer = false;
    this.fieldErrors = {};
    this.isDialogVisible = true;
  }

  editEnquiry(enquiry: Enquiry) {
    this.selectedEnquiry = { ...enquiry };
    this.lineItems = enquiry.line_items || [];
    this.vendorCards = enquiry.vendor_cards || [];
    this.isDialogVisible = true;
  }

  viewEnquiry(enquiryCode: string) {
    this.enquiryService.getEnquiryByCode(enquiryCode).subscribe({
      next: (enquiry: Enquiry) => {
        this.selectedEnquiry = { ...enquiry };
        this.currentEnquiry = { ...enquiry };
        this.lineItems = enquiry.line_items || [];
        this.vendorCards = enquiry.vendor_cards || [];
        this.isDialogVisible = true;
      },
      error: (error: any) => {
        console.error('Error fetching enquiry:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch enquiry details'
        });
      }
    });
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedEnquiry = null;
    this.lineItems = [];
    this.vendorCards = [];
    this.fieldErrors = {};
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Closed': return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Confirmed': return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold';
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB');
  }

  // Customer autocomplete methods
  searchCustomers(event: any) {
    const query = event.query;
    this.enquiryService.getCustomersDropdown(query).subscribe({
      next: (customers) => {
        this.customerSuggestions = customers;
      },
      error: (error) => {
        console.error('Error searching customers:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to search customers'
        });
      }
    });
  }

  onCustomerSelect(event: any) {
    const customer = event;
    if (customer && customer.id && this.selectedEnquiry) {
      // Existing customer - auto-fill related fields
      this.selectedEnquiry.company_name = customer.name || customer.display_name;
      this.selectedEnquiry.customer_name = customer.contact_name || '';
      this.selectedEnquiry.email = customer.email || '';
      this.selectedEnquiry.mobile = customer.mobile || '';
      this.selectedEnquiry.landline = customer.landline || '';
      this.isNewCustomer = false;
      
      // Check if customer has multiple contacts
      if (customer.contact_count && customer.contact_count > 1) {
        this.loadCustomerContacts(customer.id);
      } else {
        this.showContactDropdown = false;
        this.customerContacts = [];
        this.selectedContact = null;
      }
    } else {
      // New customer (manual entry)
      if (this.selectedEnquiry) {
        this.selectedEnquiry.company_name = typeof customer === 'string' ? customer : (customer?.display_name || customer?.name || '');
        this.selectedEnquiry.customer_name = '';
        this.selectedEnquiry.email = '';
        this.selectedEnquiry.mobile = '';
        this.selectedEnquiry.landline = '';
      }
      this.isNewCustomer = true;
      this.showContactDropdown = false;
      this.customerContacts = [];
      this.selectedContact = null;
    }
    
    // Clear company name error if it exists
    if (this.fieldErrors['company_name']) {
      delete this.fieldErrors['company_name'];
    }
  }

  loadCustomerContacts(customerId: number) {
    this.enquiryService.getCustomerContacts(customerId).subscribe({
      next: (contacts) => {
        this.customerContacts = contacts;
        this.showContactDropdown = true;
        
        // Auto-select primary contact if available
        const primaryContact = contacts.find(c => c.is_primary);
        if (primaryContact) {
          this.selectedContact = primaryContact;
          this.onContactSelect({ value: primaryContact });
        }
      },
      error: (error) => {
        console.error('Error loading customer contacts:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load customer contacts'
        });
        this.showContactDropdown = false;
      }
    });
  }

  onContactSelect(event: any) {
    const contact = event.value;
    if (contact && this.selectedEnquiry) {
      this.selectedEnquiry.customer_name = contact.name || '';
      this.selectedEnquiry.email = contact.email || '';
      this.selectedEnquiry.mobile = contact.mobile || '';
      this.selectedEnquiry.landline = contact.landline || '';
    }
  }

  // Location autocomplete methods
  searchLocations(event: any) {
    const query = event.query;
    this.enquiryService.getLocationsDropdown(query).subscribe({
      next: (locations) => {
        this.locationSuggestions = locations;
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch locations'
        });
      }
    });
  }

  // Department autocomplete methods
  searchDepartments(event: any) {
    const query = event.query;
    const context = this.contextService.getContext();
    this.enquiryService.getDepartmentsDropdown(context.companyCode, query).subscribe({
      next: (departments) => {
        this.departmentSuggestions = departments.map(dept => ({
          ...dept,
          display_name: dept.display_name || dept.name
        }));
      },
      error: (error) => {
        console.error('Error fetching departments:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch departments'
        });
      }
    });
  }

  // Basis autocomplete methods
  searchBasis(event: any) {
    const query = event.query;
    this.enquiryService.getBasisDropdown().subscribe({
      next: (basis) => {
        this.basisSuggestions = basis.filter(b => 
          b.name.toLowerCase().includes(query.toLowerCase())
        ).map(b => ({
          ...b,
          display_name: b.display_name || b.name
        }));
      },
      error: (error) => {
        console.error('Error fetching basis:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch basis'
        });
      }
    });
  }

  // Line Items methods
  addLineItem() {
    const newItem: EnquiryLineItem = {
      s_no: this.lineItems.length + 1,
      quantity: 0,
      basis: '',
      remarks: '',
      status: 'Active'
    };
    this.lineItems.push(newItem);
  }

  editLineItem(index: number) {
    // For now, items are editable inline
    // Could implement a separate edit dialog if needed
  }

  deleteLineItem(index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this line item?',
      accept: () => {
        this.lineItems.splice(index, 1);
        // Renumber items
        this.lineItems.forEach((item, i) => {
          item.s_no = i + 1;
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Line item deleted successfully'
        });
      }
    });
  }

  // Sourcing and Tariff methods
  canGetSourcing(): boolean {
    return !!(this.selectedEnquiry && 
              this.selectedEnquiry.company_name && 
              this.selectedEnquiry.from_location && 
              this.selectedEnquiry.to_location && 
              this.selectedEnquiry.effective_date_from && 
              this.selectedEnquiry.effective_date_to && 
              this.selectedEnquiry.department &&
              this.selectedEnquiry.basis &&
              this.lineItems.length > 0);
  }

  canGetTariff(): boolean {
    return !!(this.selectedEnquiry && 
              this.selectedEnquiry.company_name && 
              this.selectedEnquiry.from_location && 
              this.selectedEnquiry.to_location && 
              this.selectedEnquiry.effective_date_from && 
              this.selectedEnquiry.effective_date_to && 
              this.selectedEnquiry.department &&
              this.selectedEnquiry.basis &&
              this.lineItems.length > 0);
  }

  getSourcing() {
    if (!this.canGetSourcing()) return;

    if (!this.currentEnquiry?.code) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please save the enquiry first before getting sourcing options'
      });
      return;
    }

    const formValue = this.enquiryForm.value;
    const criteria = {
      department: formValue.department,
      from_location: formValue.from_location,
      to_location: formValue.to_location,
      effective_date_from: this.formatDateForAPI(formValue.effective_date_from),
      effective_date_to: this.formatDateForAPI(formValue.effective_date_to),
      basis: formValue.basis // Use basis from form
    };

    this.enquiryService.getSourcingOptions(this.currentEnquiry.code, criteria).subscribe({
      next: (options) => {
        this.availableVendors = options;
        this.currentVendorSource = 'sourcing';
        this.selectedVendors = [];
        this.showVendorSelectionDialog = true;
      },
      error: (error) => {
        console.error('Error getting sourcing options:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to get sourcing options'
        });
      }
    });
  }

  getTariff() {
    if (!this.canGetTariff()) return;

    if (!this.currentEnquiry?.code) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please save the enquiry first before getting tariff options'
      });
      return;
    }

    const formValue = this.enquiryForm.value;
    const criteria = {
      department: formValue.department,
      from_location: formValue.from_location,
      to_location: formValue.to_location,
      effective_date_from: this.formatDateForAPI(formValue.effective_date_from),
      effective_date_to: this.formatDateForAPI(formValue.effective_date_to),
      basis: formValue.basis // Use basis from form
    };

    this.enquiryService.getTariffOptions(this.currentEnquiry.code, criteria).subscribe({
      next: (options) => {
        this.availableVendors = options;
        this.currentVendorSource = 'tariff';
        this.selectedVendors = [];
        this.showVendorSelectionDialog = true;
      },
      error: (error) => {
        console.error('Error getting tariff options:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to get tariff options'
        });
      }
    });
  }

  addSelectedVendors() {
    this.selectedVendors.forEach(vendor => {
      const vendorCard: EnquiryVendorCard = {
        vendor_name: vendor.vendor_name,
        vendor_type: vendor.vendor_type,
        is_active: false,
        charges: vendor.charges || [],
        source_type: this.currentVendorSource,
        source_id: vendor.id
      };
      this.vendorCards.push(vendorCard);
    });

    this.showVendorSelectionDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `${this.selectedVendors.length} vendor(s) added successfully`
    });
  }

  // Vendor card methods
  onVendorActiveChange(index: number) {
    // Ensure only one vendor is active using radio button logic
    this.activeVendorIndex = index;
    this.vendorCards.forEach((card, i) => {
      card.is_active = i === index;
    });
  }

  getDisplayCharges(card: EnquiryVendorCard): any[] {
    return card.negotiated_charges && card.negotiated_charges.length > 0 
      ? card.negotiated_charges 
      : card.charges;
  }

  // Negotiation methods
  openNegotiationDialog(card: EnquiryVendorCard, index: number) {
    this.negotiatingCard = card;
    this.negotiatingCardIndex = index;
    this.negotiationCharges = JSON.parse(JSON.stringify(card.charges)); // Deep copy
    this.showNegotiationDialog = true;
  }

  saveNegotiation() {
    if (this.negotiatingCard && this.negotiatingCardIndex >= 0) {
      this.vendorCards[this.negotiatingCardIndex].negotiated_charges = [...this.negotiationCharges];
      this.showNegotiationDialog = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Negotiated charges saved successfully'
      });
    }
  }

  // Mail methods
  canGenerateMail(): boolean {
    return this.vendorCards.some(card => card.is_active) && this.enquiryForm.valid;
  }

  generateMail() {
    const activeVendor = this.vendorCards.find(card => card.is_active);
    if (!activeVendor) return;

    const enquiryData: Enquiry = {
      ...this.enquiryForm.value,
      line_items: this.lineItems,
      enquiry_no: this.currentEnquiry?.enquiry_no || 'NEW'
    };

    this.mailContent = this.enquiryService.generateMailTemplateString(enquiryData, activeVendor);
    this.showMailDialog = true;
  }

  copyMailToClipboard() {
    navigator.clipboard.writeText(this.mailContent).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Mail content copied to clipboard'
      });
    });
  }

  // Save and confirm methods
  saveEnquiry() {
    if (!this.selectedEnquiry) return;

    const enquiryData: Enquiry = {
      ...this.selectedEnquiry,
      line_items: this.lineItems,
      is_new_customer: this.isNewCustomer,
      date: this.formatDateForAPI(this.selectedEnquiry.date),
      effective_date_from: this.formatDateForAPI(this.selectedEnquiry.effective_date_from),
      effective_date_to: this.formatDateForAPI(this.selectedEnquiry.effective_date_to)
    };

    const saveOperation = this.selectedEnquiry.code 
      ? this.enquiryService.updateEnquiry(this.selectedEnquiry.code, enquiryData)
      : this.enquiryService.createEnquiry(enquiryData);

    saveOperation.subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.selectedEnquiry?.code ? 'Enquiry updated successfully' : 'Enquiry created successfully'
        });
        
        if (!this.selectedEnquiry?.code && response.code) {
          // New enquiry created, update the selectedEnquiry with auto-generated values
          this.selectedEnquiry!.id = response.id;
          this.selectedEnquiry!.enquiry_no = response.enquiry_no;
          this.selectedEnquiry!.code = response.code;
          
          // Update current enquiry for vendor cards
          this.currentEnquiry = { 
            ...enquiryData, 
            id: response.id, 
            enquiry_no: response.enquiry_no,
            code: response.code 
          };
          
          // Show success message with generated enquiry number
          this.messageService.add({
            severity: 'info',
            summary: 'Enquiry Number Generated',
            detail: `Enquiry Number: ${response.enquiry_no}`,
            life: 5000
          });
          
          if (this.vendorCards.length > 0) {
            this.saveVendorCards();
          }
        }
        
        this.loadEnquiries(); // Refresh the table
        
        // Don't hide dialog immediately for new enquiries so user can see the generated number
        if (this.selectedEnquiry?.code) {
          this.hideDialog();
        }
      },
      error: (error: any) => {
        console.error('Error saving enquiry:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save enquiry'
        });
      }
    });
  }

  canConfirmEnquiry(): boolean {
    return this.enquiryForm.valid && 
           this.lineItems.length > 0 && 
           this.vendorCards.some(card => card.is_active) &&
           this.currentEnquiry?.code !== undefined;
  }

  confirmEnquiry() {
    if (!this.canConfirmEnquiry() || !this.currentEnquiry?.code) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to confirm this enquiry? This will create a booking.',
      accept: () => {
        this.enquiryService.confirmEnquiry(this.currentEnquiry!.code!).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Enquiry confirmed successfully. Booking ${response.booking_no} created.`
            });
            this.enquiryForm.patchValue({ status: 'Confirmed' });
          },
          error: (error) => {
            console.error('Error confirming enquiry:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to confirm enquiry'
            });
          }
        });
      }
    });
  }

  saveVendorCards() {
    if (!this.currentEnquiry?.code || this.vendorCards.length === 0) return;

    this.enquiryService.addVendorCards(this.currentEnquiry.code, this.vendorCards).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Vendor cards saved successfully'
        });
      },
      error: (error) => {
        console.error('Error saving vendor cards:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save vendor cards'
        });
      }
    });
  }

  // Utility methods
  newEnquiry() {
    this.clearForm();
  }

  viewAllEnquiries() {
    // Navigate to enquiry list view
    // This would typically use router navigation
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Navigate to enquiry list view'
    });
  }

  clearForm() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to clear the form? All unsaved data will be lost.',
      accept: () => {
        if (this.selectedEnquiry) {
          this.selectedEnquiry = {
            id: undefined,
            enquiry_no: '',
            date: new Date().toISOString().split('T')[0],
            customer_name: '',
            company_name: '',
            email: '',
            mobile: '',
            landline: '',
            department: '',
            basis: '',
            from_location: '',
            to_location: '',
            effective_date_from: '',
            effective_date_to: '',
            status: 'Open',
            remarks: '',
            line_items: []
          };
        }
        this.lineItems = [];
        this.vendorCards = [];
        this.isNewCustomer = false;
        this.addLineItem();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Form cleared successfully'
        });
      }
    });
  }

  private loadMappedEnquirySeriesCode() {
    const context = this.contextService.getContext();
    
    // Try context-based mapping first
    this.mappingService.findMappingByContext(
      'enquiryNo',
      context.companyCode || '',
      context.branchCode || '',
      context.departmentCode || '',
      context.serviceType || ''
    ).subscribe({
      next: (contextMapping: any) => {
        if (contextMapping && contextMapping.mapping) {
          this.mappedEnquirySeriesCode = contextMapping.mapping;
          this.checkSeriesManualFlag();
        } else {
          // Fallback to generic mapping
          this.mappingService.getMapping().subscribe({
            next: (mapping: any) => {
              this.mappedEnquirySeriesCode = mapping.enquiryNo;
              if (this.mappedEnquirySeriesCode) {
                this.checkSeriesManualFlag();
              } else {
                this.isManualSeries = true;
              }
            },
            error: () => {
              this.isManualSeries = true;
            }
          });
        }
      },
      error: () => {
        this.isManualSeries = true;
      }
    });
  }

  private checkSeriesManualFlag() {
    if (this.mappedEnquirySeriesCode) {
      this.numberSeriesService.getAll().subscribe({
        next: (seriesList: any[]) => {
          const found = seriesList.find((s: any) => s.code === this.mappedEnquirySeriesCode);
          this.isManualSeries = !!(found && found.is_manual);
          
          // Update the code field if we have a selected enquiry
          if (this.selectedEnquiry) {
            this.selectedEnquiry.code = this.isManualSeries ? '' : (this.mappedEnquirySeriesCode || '');
          }
        },
        error: () => {
          this.isManualSeries = true;
          if (this.selectedEnquiry) {
            this.selectedEnquiry.code = '';
          }
        }
      });
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.enquiryForm.controls).forEach(key => {
      this.enquiryForm.get(key)?.markAsTouched();
    });
  }

  private formatDateForAPI(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}