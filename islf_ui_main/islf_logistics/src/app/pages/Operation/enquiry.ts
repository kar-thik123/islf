import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import { EnquiryService, Enquiry, EnquiryLineItem, EnquiryVendorCard, CustomerDropdown, CustomerContact, SourcingOption, TariffOption } from '../../services/enquiry.service';
import { ContextService } from '../../services/context.service';
import { MappingService } from '../../services/mapping.service';
import { NumberSeriesService } from '../../services/number-series.service';
import { MasterLocationService } from '../../services/master-location.service';
import { DepartmentService } from '../../services/department.service';
import { BasisService } from '../../services/basis.service';
import { ServiceTypeService } from '../../services/servicetype.service';
import { MasterTypeService } from '../../services/mastertype.service';
import {AuthService} from '../../services/auth.service';
import { MasterLocationComponent } from '../masters/masterlocation';
import { BasisComponent } from '../masters/basis';
import { MasterTypeComponent } from '../masters/mastertype';
import { forkJoin, from } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ServiceAreaService, ServiceArea } from '../../services/service-area.service';
import { catchError} from 'rxjs/operators';
import { of } from 'rxjs';
import { ServiceAreaComponent } from '../masters/servicearea';
import { SourceSalesService } from '@/services/source-sales.service';
import { SourceSalesComponent } from '../masters/sourceSales';


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
    TooltipModule,
    ConfirmDialogModule,
    AutoCompleteModule,
    InputNumberModule,
    CheckboxModule,
    RadioButtonModule,
    DividerModule,
    FieldsetModule,
    PanelModule,
    AccordionModule,
    MasterLocationComponent,
    BasisComponent,
    MasterTypeComponent,
    ServiceAreaComponent,
    SourceSalesComponent
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
        [globalFilterFields]="['enquiry_no', 'customer_name', 'company_name', 'department', 'service_type', 'from_location', 'to_location', 'status']"
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
                Service Type
                <p-columnFilter type="text" field="service_type" display="menu" placeholder="Search by service type"></p-columnFilter>
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
            <td>{{ enquiry.customer_name}}</td>
            <td>{{ enquiry.company_name }}</td>
            <td>{{ enquiry.department }}</td> 
            <td>{{ enquiry.service_type }}</td>
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
      header="{{ selectedEnquiry?.id ? 'Edit' : 'Add' }} Enquiry"
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
                <label class="block font-semibold mb-1">Code <span class="text-red-500">*</span></label>
                <input 
                  id="code"
                  pInputText 
                  [(ngModel)]="selectedEnquiry.code"
                  (ngModelChange)="onFieldChange('code', selectedEnquiry.code)"
                  [ngClass]="getFieldErrorClass('code')"
                  [ngStyle]="getFieldErrorStyle('code')"
                  [disabled]="!isManualSeries || !selectedEnquiry.isNew"
                  [placeholder]="isManualSeries ? 'Enter enquiry code' : mappedEnquirySeriesCode || 'Auto-generated'"
                  class="w-full">
                <small *ngIf="fieldErrors['code']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['code'] }}</small>
              </div>  
              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Date</label>
                <p-calendar 
                  id="date"
                  [(ngModel)]="selectedDate"
                  (ngModelChange)="onDateChange($event)"
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
                <div class="flex gap-2">
                  <div class="flex-1" *ngIf="!isManualCompanyName">
                    <p-dropdown
                  id="company_name"
                      [(ngModel)]="selectedCustomer"
                      [options]="customerOptions"
                      optionLabel="display_name"
                      optionValue="id"
                      placeholder="Select Company"
                      [filter]="true"
                      filterBy="display_name"
                      [showClear]="true"
                      (onChange)="onCustomerSelect($event)"
                      [ngClass]="getFieldErrorClass('company_name')"
                      [ngStyle]="getFieldErrorStyle('company_name')"
                      class="w-full">
                      <ng-template let-customer pTemplate="item">
                        <div>
                          <div class="font-semibold">{{ customer.name }}</div>
                          <div class="text-sm text-gray-500">{{ customer.company_name || customer.name }}</div>
                        </div>
                      </ng-template>
                    </p-dropdown>
                  </div>
                  <div class="flex-1" *ngIf="isManualCompanyName">
                    <input 
                      id="company_name_manual"
                      pInputText 
                  [(ngModel)]="selectedEnquiry.company_name"
                      placeholder="Enter company name manually"
                      [ngClass]="getFieldErrorClass('company_name')"
                      [ngStyle]="getFieldErrorStyle('company_name')"
                      class="w-full">
                  </div>
                  <button 
                    pButton 
                    type="button" 
                    [icon]="isManualCompanyName ? 'pi pi-list' : 'pi pi-pencil'" 
                    (click)="toggleManualCompanyName()"
                    [pTooltip]="isManualCompanyName ? 'Switch to dropdown' : 'Switch to manual entry'"
                    class="p-button-sm p-button-outlined">
                  </button>
                </div>
                <small *ngIf="fieldErrors['company_name']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['company_name'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Name</label>
                <div class="flex gap-2">
                  <div class="flex-1">
                    <div *ngIf="showContactDropdown && !isManualName; else manualNameInput">
                  <p-dropdown
                    id="name"
                    [(ngModel)]="selectedContact"
                    [options]="customerContacts"
                    optionLabel="name"
                    placeholder="Select contact person"
                        (onChange)="onContactSelect($event)"
                        class="w-full">
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
                        placeholder="Enter contact person name"
                        class="w-full">
                </ng-template>
                  </div>
                  <button 
                    pButton 
                    type="button" 
                    [icon]="isManualName ? 'pi pi-list' : 'pi pi-pencil'" 
                    (click)="toggleManualName()"
                    [pTooltip]="isManualName ? 'Switch to dropdown' : 'Switch to manual entry'"
                    class="p-button-sm p-button-outlined"
                    [disabled]="!showContactDropdown && !isManualName">
                  </button>
                </div>
              </div>
              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Email</label>
                <div class="flex gap-2">
                <input 
                  id="email"
                  pInputText 
                  [(ngModel)]="selectedEnquiry.email"
                  placeholder="Auto-filled from customer"
                    [readonly]="!isNewCustomer && !isManualEmail"
                    class="flex-1">
                  <button 
                    pButton 
                    type="button" 
                    [icon]="isManualEmail ? 'pi pi-lock' : 'pi pi-pencil'" 
                    (click)="toggleManualEmail()"
                    [pTooltip]="isManualEmail ? 'Lock to auto-fill' : 'Enable manual entry'"
                    class="p-button-sm p-button-outlined">
                  </button>
                </div>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Mobile</label>
                <div class="flex gap-2">
                <input 
                  id="mobile"
                  pInputText 
                  [(ngModel)]="selectedEnquiry.mobile"
                  placeholder="Auto-filled from customer"
                    [readonly]="!isNewCustomer && !isManualMobile"
                    class="flex-1">
                  <button 
                    pButton 
                    type="button" 
                    [icon]="isManualMobile ? 'pi pi-lock' : 'pi pi-pencil'" 
                    (click)="toggleManualMobile()"
                    [pTooltip]="isManualMobile ? 'Lock to auto-fill' : 'Enable manual entry'"
                    class="p-button-sm p-button-outlined">
                  </button>
                </div>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Landline</label>
                <div class="flex gap-2">
                <input 
                  id="landline"
                  pInputText 
                  [(ngModel)]="selectedEnquiry.landline"
                  placeholder="Auto-filled from customer"
                    [readonly]="!isNewCustomer && !isManualLandline"
                    class="flex-1">
                  <button 
                    pButton 
                    type="button" 
                    [icon]="isManualLandline ? 'pi pi-lock' : 'pi pi-pencil'" 
                    (click)="toggleManualLandline()"
                    [pTooltip]="isManualLandline ? 'Lock to auto-fill' : 'Enable manual entry'"
                    class="p-button-sm p-button-outlined">
                  </button>
                </div>
              </div>
                <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">From Location Type</label>
                <div class="flex gap-2">
                  <p-dropdown 
                    appendTo="body" 
                    [options]="locationTypeFromOptions" 
                    [(ngModel)]="selectedEnquiry.location_type_from" 
                    (ngModelChange)="onLocationTypeFromChange($event)" 
                    placeholder="Select From Location Type" 
                    [filter]="true" 
                    filterBy="label" 
                    [showClear]="true" 
                    class="flex-1">
                  </p-dropdown>
                  <button pButton 
                    [icon]="masterDialogLoading['locationTypeFrom'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                    class="p-button-sm" 
                    [disabled]="masterDialogLoading['locationTypeFrom']"
                    (click)="openMaster('locationTypeFrom')">
                  </button>
                </div>
              </div>
              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">From Location <span class="text-red-500">*</span></label>
                <div class="flex gap-2">
                  <p-dropdown 
                    appendTo="body" 
                    [options]="fromLocationOptions" 
                    [(ngModel)]="selectedEnquiry.from_location" 
                    (ngModelChange)="onFieldChange('from_location', selectedEnquiry.from_location)" 
                    [ngClass]="getFieldErrorClass('from_location')" 
                    [ngStyle]="getFieldErrorStyle('from_location')" 
                    placeholder="Select From Location" 
                    [filter]="true" 
                    filterBy="label" 
                    [showClear]="true" 
                    class="flex-1">
                  </p-dropdown>
                  <button pButton 
                    [icon]="masterDialogLoading['from'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                    class="p-button-sm" 
                    [disabled]="masterDialogLoading['from']"
                    (click)="openMaster('from')">
                  </button>
                </div>
                <small *ngIf="fieldErrors['from_location']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['from_location'] }}</small>
              </div>
               <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">To Location Type</label>
                <div class="flex gap-2">
                  <p-dropdown 
                    appendTo="body" 
                    [options]="locationTypeToOptions" 
                    [(ngModel)]="selectedEnquiry.location_type_to" 
                    (ngModelChange)="onLocationTypeToChange($event)" 
                    placeholder="Select To Location Type" 
                    [filter]="true" 
                    filterBy="label" 
                    [showClear]="true" 
                    class="flex-1">
                  </p-dropdown>
                  <button pButton 
                    [icon]="masterDialogLoading['locationTypeTo'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                    class="p-button-sm" 
                    [disabled]="masterDialogLoading['locationTypeTo']"
                    (click)="openMaster('locationTypeTo')">
                  </button>
                </div>
              </div>


              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">To Location <span class="text-red-500">*</span></label>
                <div class="flex gap-2">
                  <p-dropdown 
                    appendTo="body" 
                    [options]="toLocationOptions" 
                    [(ngModel)]="selectedEnquiry.to_location" 
                    (ngModelChange)="onFieldChange('to_location', selectedEnquiry.to_location)" 
                    [ngClass]="getFieldErrorClass('to_location')" 
                    [ngStyle]="getFieldErrorStyle('to_location')" 
                    placeholder="Select To Location" 
                    [filter]="true" 
                    filterBy="label" 
                    [showClear]="true" 
                    class="flex-1">
                  </p-dropdown>
                  <button pButton 
                    [icon]="masterDialogLoading['to'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                    class="p-button-sm" 
                    [disabled]="masterDialogLoading['to']"
                    (click)="openMaster('to')">
                  </button>
                </div>
                <small *ngIf="fieldErrors['to_location']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['to_location'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Department</label>
                <p-dropdown 
                  [options]="departmentOptions" 
                  [(ngModel)]="selectedEnquiry.department" 
                  (ngModelChange)="onFieldChange('department', selectedEnquiry.department); filterServiceType()" 
                  [ngClass]="getFieldErrorClass('department')" 
                  [ngStyle]="getFieldErrorStyle('department')" 
                  placeholder="Select Department" 
                  [filter]="true" 
                  filterBy="label" 
                  [showClear]="true" 
                  class="w-full">
                </p-dropdown>
                <small *ngIf="fieldErrors['department']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['department'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Service Type</label>
                <p-dropdown 
                  [options]="serviceTypeOptions" 
                  [(ngModel)]="selectedEnquiry.service_type" 
                  (ngModelChange)="onFieldChange('service_type', selectedEnquiry.service_type)" 
                  [ngClass]="getFieldErrorClass('service_type')" 
                  [ngStyle]="getFieldErrorStyle('service_type')" 
                  placeholder="Select Service Type" 
                  [filter]="true" 
                  filterBy="label" 
                  [showClear]="true" 
                  class="w-full">
                </p-dropdown>
                <small *ngIf="fieldErrors['service_type']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['service_type'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1">Effective Date From</label>
                <p-calendar 
                  id="effective_date_from"
                  [(ngModel)]="selectedEffectiveDateFrom"
                  (ngModelChange)="onEffectiveDateFromChange($event)"
                  [showIcon]="true"
                  dateFormat="dd-mm-yy"
                  appendTo="body"
                  placeholder="Select Effective Date From"
                  [showTime]="false"
                  [timeOnly]="false">
                </p-calendar>
                <small *ngIf="fieldErrors['effective_date_from']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['effective_date_from'] }}</small>
              </div>

              <div class="col-span-12 md:col-span-3">
                 <label class="block font-semibold mb-1">Effective Date To</label>
                <p-calendar 
                  id="effective_date_to"
                  [(ngModel)]="selectedEffectiveDateTo"
                  (ngModelChange)="onEffectiveDateToChange($event)"
                  [showIcon]="true"
                  dateFormat="dd-mm-yy"
                  appendTo="body"
                  placeholder="Select Effective Date To"
                  [showTime]="false"
                  [timeOnly]="false">
                </p-calendar>
                <small *ngIf="fieldErrors['effective_date_to']" class="p-error text-red-500 text-xs ml-2">{{ fieldErrors['effective_date_to'] }}</small>
              </div>
              <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Source/Sales Person</label>
              <div class="flex gap-2">
                <p-dropdown 
                  [options]="sourceSalesOptions" 
                  [(ngModel)]="selectedEnquiry.source_sales_code" 
                  (ngModelChange)="onSourceSalesChange()" 
                  [ngClass]="getFieldErrorClass('source_sales_code')" 
                  [ngStyle]="getFieldErrorStyle('source_sales_code')" 
                  placeholder="Select Source/Sales Person" 
                  optionLabel="label"
                  optionValue="value"
                  [filter]="true"
                  filterBy="label"
                  class="flex-1">
                </p-dropdown>
                <button pButton 
                  [icon]="masterDialogLoading['sourceSales'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                  class="p-button-sm" 
                  [disabled]="masterDialogLoading['sourceSales']"
                  (click)="openMaster('sourceSales')"></button>
              </div>
              <small *ngIf="fieldErrors['sourceSalesCode']" class="p-error">{{ fieldErrors['sourceSalesCode'] }}</small>
            </div>         
              

              <div class="col-span-12 md:col-span-6">
                <label class="block font-semibold mb-1">Remarks</label>
                <textarea 
                  id="remarks"
                  pInputTextarea 
                  [(ngModel)]="selectedEnquiry.remarks"
                  rows="3"
                  placeholder="Enter remarks"
                  class="w-full">
                  >
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
                  placeholder="Select Status"
                  class="w-full">
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
                  <th >S.No.</th>
                  <th >Quantity</th>
                  <th>Type</th>
                  <th >Service Area</th>
                  <th >Basis</th>
                  <th>Remarks</th>
                  <th >Status</th>
                  <th style>Actions</th>
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
                    <div class="flex gap-2">
                    <p-dropdown
                      [(ngModel)]="item.type"
                      [options]="masterTypeOptions"
                        optionLabel="label"
                        optionValue="value" 
                        placeholder="Select type"
                        class="flex-1"
                        appendTo="body">
                    </p-dropdown>
                      <button pButton 
                        [icon]="masterDialogLoading['masterType'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                        class="p-button-sm"
                        [disabled]="masterDialogLoading['masterType']"
                        (click)="openMaster('masterType')"
                        appendTo="body">
                      </button>
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-2">
                    <p-dropdown
                      [(ngModel)]="item.service_area"
                      [options]="serviceAreaDropdownOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select service area"
                        class="flex-1"
                        appendTo="body">
                    </p-dropdown>
                      <button pButton 
                        [icon]="masterDialogLoading['serviceArea'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                        class="p-button-sm"
                        [disabled]="masterDialogLoading['serviceArea']"
                        (click)="openMaster('serviceArea')"
                        appendTo="body">
                      </button>
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-2">
                    <p-dropdown
                      [(ngModel)]="item.basis"
                      [options]="basisOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select basis"
                        class="flex-1"
                        appendTo="body">
                    </p-dropdown>
                      <button pButton 
                        [icon]="masterDialogLoading['basis'] ? 'pi pi-spin pi-spinner' : 'pi pi-ellipsis-h'" 
                        class="p-button-sm" 
                        [disabled]="masterDialogLoading['basis']"
                        (click)="openMaster('basis')"
                        appendTo="body">
                      </button>
                    </div>
                  </td>
                  <td>
                    <input 
                      pInputText 
                      [(ngModel)]="item.remarks"
                      placeholder="Remarks"
                      class="w-full">
                  </td>
                  <td>
                    <p-dropdown
                      [(ngModel)]="item.status"
                      [options]="lineItemStatusOptions"
                      optionLabel="label"
                      optionValue="value"
                      appendTo="body">
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
              <button pButton type="button" label="Get Sourcing" icon="pi pi-search" (click)="getSourcing()" class="p-button-info" 
                pTooltip="Query Sourcing Table with matching conditions"></button>
              <button pButton type="button" label="Get Tariff" icon="pi pi-calculator" (click)="getTariff()"  class="p-button-secondary"
                pTooltip="Fetch directly from Tariff Table"></button>
            </div>
          </div>

          <!-- Vendor Cards Section -->
          <div *ngIf="vendorCards.length > 0" class="mb-4">
            <h3 class="text-lg font-semibold mb-3">Vendor Cards</h3>
            <div class="vendor-cards-container">
              <p-table 
                [value]="vendorCards" 
                [responsive]="true"
                [showGridlines]="true"
                [rowHover]="true"
                styleClass="vendor-cards-table">
                <ng-template pTemplate="header">
                  <tr>
                    <th style="width: 3rem">Active</th>
                    <th>Vendor Name</th>
                    <th>Basis</th>
                    <th>Quantity</th>
                    <th>Currency</th>
                    <th>Charges</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-card let-i="rowIndex">
                  <tr [ngClass]="{'active-vendor-row': card.is_active}">
                    <td>
                      <p-radioButton 
                        [(ngModel)]="activeVendorIndex"
                        [value]="i"
                        (onChange)="onVendorActiveChange(i)">
                      </p-radioButton>
                    </td>
                    <td>
                      <div class="font-semibold">{{ card.vendor_name }}</div>
                      <div class="text-sm text-gray-600">{{ card.source_type | titlecase }} Source</div>
                    </td>
                    <td>{{ getVendorBasis(card) }}</td>
                    <td>{{ formatQuantity(card.quantity) }}</td>
                    <td>{{ card.currency || 'N/A' }}</td>
                    <td>
                      <div class="charges-display">
                        {{ getDisplayCharges(card) }}
                        <div *ngIf="!getDisplayCharges(card) || getDisplayCharges(card) === 0" class="text-gray-500 text-sm">
                          No charges available
                        </div>
                      </div>
                    </td>
                    <td>{{ card.remarks || 'N/A' }}</td>
                    <td>
                      <div class="flex gap-1">
                        <button 
                          pButton 
                          type="button" 
                          icon="pi pi-pencil" 
                          (click)="editVendorCard(card, i)" 
                          class="p-button-sm p-button-text"
                          pTooltip="Edit vendor details">
                        </button>
                        <button 
                          pButton 
                          type="button" 
                          icon="pi pi-trash" 
                          (click)="removeVendorCard(i)" 
                          class="p-button-sm p-button-danger p-button-text"
                          pTooltip="Remove vendor card">
                        </button>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
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
              *ngIf="!selectedEnquiry?.id"
              label="Save Draft" 
              icon="pi pi-save" 
              (click)="saveEnquiry()"
              severity="info"
              size="small">
            </p-button>
            <p-button 
              *ngIf="selectedEnquiry?.id"
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
              <th>Currency</th>
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
              <td>{{ vendor.currency || 'N/A' }}</td>
              <td>
                {{vendor.charges}}
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



      <!-- Edit Vendor Card Dialog -->
      <p-dialog 
        header="Edit Vendor Card" 
        [(visible)]="showEditVendorDialog" 
        [modal]="true" 
        [style]="{width: '70vw'}">
        <div *ngIf="editingCard">
          <h4>{{ editingCard.vendor_name }}</h4>
          
          <!-- Sourcing Details Section -->
          <div class="grid grid-cols-12 gap-4 mb-4">
            <div class="col-span-12">
              <h5 class="font-semibold mb-3">Sourcing Details</h5>
            </div>
            
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Mode</label>
              <input 
                pInputText 
                [(ngModel)]="editingCard.mode"
                placeholder="Transportation mode"
                class="w-full">
            </div>
            
            <div class="col-span-12 md:col-span-4">
              <label class="block font-semibold mb-1">From Location</label>
              <input 
                pInputText 
                [(ngModel)]="editingCard.from_location"
                placeholder="Origin location"
                class="w-full">
            </div>
            
            <div class="col-span-12 md:col-span-4">
              <label class="block font-semibold mb-1">To Location</label>
              <input 
                pInputText 
                [(ngModel)]="editingCard.to_location"
                placeholder="Destination location"
                class="w-full">
            </div>
            
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Basis</label>
              <input 
                pInputText 
                [(ngModel)]="editingCard.basis"
                placeholder="Pricing basis"
                class="w-full">
            </div>
          </div>
        </div>
        
        <ng-template pTemplate="footer">
          <p-button 
            label="Cancel" 
            icon="pi pi-times" 
            (onClick)="cancelVendorCardEdit()"
            class="p-button-text">
          </p-button>
          <p-button 
            label="Save Changes" 
            icon="pi pi-check" 
            (onClick)="saveVendorCardEdit()">
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

      <!-- Master Location Dialog -->
      <p-dialog
        header="Location Master"
        [(visible)]="showMasterLocationDialog"
        [modal]="true"
        [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
        [contentStyle]="{ overflow: 'visible' }"
        [baseZIndex]="10000"
        [closable]="true"
        [draggable]="false"
        [resizable]="false"
        (onHide)="closeMasterDialog('masterLocation')"
        [closeOnEscape]="true"
      >
        <ng-template pTemplate="content">
          <master-location></master-location>
        </ng-template>
      </p-dialog>

      <!-- Basis Dialog -->
      <p-dialog
        header="Basis Code Master"
        [(visible)]="showBasisDialog"
        [modal]="true"
        [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
        [contentStyle]="{ overflow: 'visible' }"
        [baseZIndex]="10000"
        [closable]="true"
        [draggable]="false"
        [resizable]="false"
        (onHide)="closeMasterDialog('basis')"
        [closeOnEscape]="true"
      >
        <ng-template pTemplate="content">
          <basis-code></basis-code>
        </ng-template>
      </p-dialog>
      <!--Master Type Dialog-->
      <p-dialog
       header="Service Type Master"
        [(visible)]="showServiceTypeDialog"
        [modal]="true"
        [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
        [contentStyle]="{ overflow: 'visible' }"
        [baseZIndex]="10000"
        [closable]="true"
        [draggable]="false"
        [resizable]="false"
        (onHide)="closeMasterDialog('serviceType')"
        [closeOnEscape]="true"
      >
        <ng-template pTemplate="content">
        <master-type [filterByKey]="'SERVICE_AREA'"></master-type>
        </ng-template>
      </p-dialog>
      <!-- Master Type Dialog -->
      <p-dialog
        header="Master Type"
        [(visible)]="showMasterTypeDialog"
        [modal]="true"
        [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
        [contentStyle]="{ overflow: 'visible' }"
        [baseZIndex]="10000"
        [closable]="true"
        [draggable]="false"
        [resizable]="false"
        (onHide)="closeMasterDialog('masterType')"
        [closeOnEscape]="true"
      >
        <ng-template pTemplate="content">
          <master-type [filterByKey]="masterTypeFilter"></master-type>
        </ng-template>
      </p-dialog>
    <!--serviceAreaMaster-->
      <p-dialog
        header="Service Area Master"
        [(visible)]="showServiceAreaDialog"
        [modal]="true"
        [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
        [contentStyle]="{ overflow: 'visible' }"
        [baseZIndex]="10000"
        [closable]="true"
        [draggable]="false"
        [resizable]="false"
        (onHide)="closeMasterDialog('serviceArea')"
        [closeOnEscape]="true"
      > 
        <ng-template pTemplate="content">
          <app-service-area></app-service-area>    
        </ng-template>
      </p-dialog>
       <!-- Source Sales Dialog -->
    <p-dialog
      header="Source Sales Master"
      [(visible)]="showSourceSalesDialog"
      [modal]="true"
      [style]="{ width: 'auto', minWidth: '60vw', maxWidth: '95vw', height: 'auto', maxHeight: '90vh' }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('sourceSales')"
      [closeOnEscape]="true"
    >
      <ng-template pTemplate="content">
        <app-source-sales *ngIf="showSourceSalesDialog"></app-source-sales>
      </ng-template>
    </p-dialog>

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

    .vendor-cards-container {
      margin-top: 1rem;
    }

    .vendor-cards-table .active-vendor-row {
      background-color: #f0f8ff !important;
      border-left: 4px solid #007ad9;
    }

    .vendor-cards-table .active-vendor-row:hover {
      background-color: #e6f3ff !important;
    }

    .charges-display {
      max-width: 200px;
    }

    .charges-display .text-sm {
      margin-bottom: 2px;
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
  showServiceAreaDialog = false;
  serviceAreaDropdownOptions: { label: string, value: string }[] = [];
  selectedServiceArea: string = '';
  enquiryForm!: FormGroup;
  lineItems: EnquiryLineItem[] = [];
  vendorCards: EnquiryVendorCard[] = [];
  allLocations: any[] = [];
  sourceSalesOptions: any[] = [];
  showSourceSalesDialog = false;
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

  // Location options
  locationOptions: any[] = [];
  fromLocationOptions: any[] = [];
  toLocationOptions: any[] = [];
  
  // Department options
  departmentOptions: any[] = [];
  
  // Basis options
  basisOptions: any[] = [];
  serviceAreaOptions: any[] = [];

  // Service type options
  serviceTypeOptions: any[] = [];
  allServiceTypes: any[] = [];

  // Location type options
  locationTypeFromOptions: any[] = [];
  locationTypeToOptions: any[] = [];
  allLocationTypes: any[] = [];

  // Mode options for vendor cards
  modeOptions = [
    { label: 'Transportation', value: 'Transportation' },
    { label: 'Shipping', value: 'Shipping' },
    { label: 'Air Freight', value: 'Air Freight' },
    { label: 'Rail', value: 'Rail' },
    { label: 'Road', value: 'Road' }
  ];

  currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'INR', value: 'INR' },
    { label: 'AED', value: 'AED' }
  ];

  // Customer dropdown
  customerOptions: CustomerDropdown[] = [];
  selectedCustomer: any = null;
  
  // Master dialog states
  showMasterLocationDialog = false;
  showBasisDialog = false;
  showMasterTypeDialog = false;
 
  showServiceTypeDialog = false;
  masterTypeFilter = '';
  masterDialogLoading: { [key: string]: boolean } = {
    sourceSales:false
  };

  // Contact management
  customerContacts: CustomerContact[] = [];
  selectedContact: CustomerContact | null = null;
  showContactDropdown = false;
  
  // Manual entry toggles for contact fields
  isManualCompanyName = false;
  isManualName = false;
  isManualEmail = false;
  isManualMobile = false;
  isManualLandline = false;
  
  // Number series properties for code field
  isManualSeries: boolean = false;
  mappedEnquirySeriesCode: string = '';
  
  // Dialog states
  showVendorSelectionDialog = false;
  showEditVendorDialog = false;
  showMailDialog = false;

  // Vendor management
  availableVendors: (SourcingOption | TariffOption)[] = [];
  selectedVendors: (SourcingOption | TariffOption)[] = [];
  currentVendorSource: 'sourcing' | 'tariff' = 'sourcing';
  
  // Edit vendor card properties
  editingCard: EnquiryVendorCard | null = null;
  editingCardIndex = -1;
  
  // Mail
  mailContent = '';
  
  // Current enquiry
  currentEnquiry: Enquiry | null = null;
  isNewCustomer = false;
  activeVendorIndex: number = -1;

  // Date objects for calendar components
  selectedDate: Date | null = null;
  selectedEffectiveDateFrom: Date | null = null;
  selectedEffectiveDateTo: Date | null = null;


  constructor(
    private fb: FormBuilder,
    private enquiryService: EnquiryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private contextService: ContextService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private masterLocationService: MasterLocationService,
    private departmentService: DepartmentService,
    private basisService: BasisService,
    private serviceAreaService: ServiceAreaService,
    private serviceTypeService: ServiceTypeService,
    private masterTypeService: MasterTypeService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private sourceSalesService: SourceSalesService,
  ) {
    this.initializeForm();
  }

  ngOnInit() {
  this.loadServiceAreaOptions().subscribe();
    // console.log("Debug: obtaining username from the auth service during enquiry on Init", this.authService.getUserName())
    this.loadInitialData();
    this.loadMappedEnquirySeriesCode();
    this.loadMasterTypeOptions();
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
      service_type: [''],
      status: ['Open', Validators.required],
      remarks: ['']
    });
  }

  loadInitialData() {
    // Load any initial data needed from masters.
    forkJoin({
      enquiries: this.loadEnquiries(),
      locations: this.loadLocations(),
      departments: this.loadDepartments(),
      basis: this.loadBasisOptions(),
      customers: this.loadCustomers(),
      serviceTypes: this.loadServiceTypes(),
      locationTypes: this.loadLocationTypes(),
      serviceAreas:this.loadServiceAreaOptions(),
      sourceSales:this.loadSourceSalesOptions(),
    }).subscribe({
      next: () => {
        console.log('All initial data loaded successfully');
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load initial data'
        });
      }
    });
  }

  // Load locations from the location masters
  loadLocations() {
    return this.masterLocationService.getAll().pipe(
      tap((locations: any[]) => {
        this.allLocations = locations.filter(l => l.active);
        console.log('Loaded all locations:', this.allLocations.length);
        
        // Initialize location options formatted as CODE - NAME
        this.fromLocationOptions = this.allLocations.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
        this.toLocationOptions = this.allLocations.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
        
        console.log('From location options:', this.fromLocationOptions.length);
        console.log('To location options:', this.toLocationOptions.length);
      })
    );
  }

  loadEnquiries() {
    return this.enquiryService.getAllEnquiries().pipe(
      tap((enquiries: Enquiry[]) => {
        console.log("Debug: Enquiry response from initial data",enquiries)
        this.enquiries = (enquiries as any)["data"];
        console.log("this.enquiry property value after assignment",this.enquiries);
      })
    );
  }

  // Load departments from the department service
  loadDepartments() {
    const context = this.contextService.getContext();
    
    const departmentObservable = context.branchCode 
      ? this.departmentService.getByBranch(context.branchCode)
      : this.departmentService.getAll();
    
    return departmentObservable.pipe(
      tap((departments: any[]) => {
        console.log('Departments loaded for context:', context, departments);
        
        // Get unique department names with case-insensitive deduplication
        const uniqueNames = new Map<string, string>();
        (departments || [])
          .filter(d => !d.status || d.status === 'Active' || d.status === 'active' || d.status === '' || d.status === null)
          .forEach(d => {
            if (d.name && d.name.trim()) {
              const lowerName = d.name.trim().toLowerCase();
              if (!uniqueNames.has(lowerName)) {
                uniqueNames.set(lowerName, d.name.trim());
              }
            }
          });
        
        this.departmentOptions = Array.from(uniqueNames.values())
          .map(name => ({ label: name, value: name }))
          .sort((a, b) => a.label.localeCompare(b.label));
        
        console.log('Department options:', this.departmentOptions);
      })
    );
  }

  // Load basis options from the basis service
  loadBasisOptions() {
    return this.basisService.getAll().pipe(
      tap((basis: any[]) => {
        this.basisOptions = (basis || [])
          .filter(b => b.status === 'Active')
          .map(b => ({ label: `${b.code} - ${b.description}`, value: b.code }));
        
        console.log('Basis options:', this.basisOptions);
      })
    );
  }
loadServiceAreaOptions() {
    return this.serviceAreaService.getServiceAreas().pipe(
      tap((serviceAreas: any[]) => {
        this.serviceAreaOptions = (serviceAreas || [])
          .filter(sa => sa.status === 'active')
          .map(sa => ({ label: sa.service_area, value: sa.service_area }));
        console.log('Service area options:', this.serviceAreaOptions);
      }),
      catchError(error => {
        console.error('Error loading service areas:', error);
        return of([]);
      })
    );
  }
  
  loadSourceSalesOptions() {
    return this.sourceSalesService.getSourceSales().pipe(
      tap((sourceSales: any[]) => {
        this.sourceSalesOptions = (sourceSales || [])
          .filter(s => s.status === 'active' || s.status === 'Active')
          .map(s => ({ label: `${s.code} - ${s.name}`, value: s.code }));
        console.log('Source sales options loaded:', this.sourceSalesOptions);
      }),
      catchError(error => {
        console.error('Error loading source sales:', error);
        return of([]);
      })
    );
  }
  
  // Property to store source sales person name
  sourceSalesPersonName: string = '';

  onSourceSalesChange() {
    if (this.selectedEnquiry && this.selectedEnquiry?.source_sales_code) {
      const selected = this.sourceSalesOptions.find(option => option.value === this.selectedEnquiry?.source_sales_code);
      if (selected) {
        // Store the label in a local property since sourceSalesPerson doesn't exist on Enquiry
        this.sourceSalesPersonName = selected.label;
      }
    }
  }


  // Load customers from the enquiry service
  loadCustomers() {
    return this.enquiryService.getCustomersDropdown('').pipe(
      tap((customers: CustomerDropdown[]) => {
        this.customerOptions = customers || [];
        console.log('Customer options loaded:', this.customerOptions.length);
      })
    );
  }

  // Load service types
  loadServiceTypes() {
    return this.serviceTypeService.getAll().pipe(
      tap((serviceTypes: any[]) => {
        this.allServiceTypes = serviceTypes || [];
        this.serviceTypeOptions = this.allServiceTypes.map(st => ({
          label: `${st.code} - ${st.name}`,
          value: st.code
        }));
        console.log('Service type options loaded:', this.serviceTypeOptions);
      })
    );
  }

  // Load location types
  loadLocationTypes() {
    const context = this.contextService.getContext();
    return this.masterTypeService.getAll().pipe(
      tap((locationTypes: any[]) => {
        console.log("DEBUG: Loading the initial value from the location types,", locationTypes);
        // Fix: Use 'key' instead of 'type' and add status filter
        this.allLocationTypes = locationTypes?.filter(lt => lt.key === 'LOCATION' && lt.status === 'Active') || [];
        console.log("DEBUG: Filtered location types:", this.allLocationTypes);
        
        this.locationTypeFromOptions = this.allLocationTypes.map(lt => ({
          label: lt.value, // Use 'value' field for display
          value: lt.value  // Use 'value' field for the actual value
        }));
        this.locationTypeToOptions = [...this.locationTypeFromOptions];
        console.log('Location type options loaded:', this.locationTypeFromOptions.length, this.locationTypeFromOptions);
      })
    );
  }

  // Master type options property
  masterTypeOptions: { label: string; value: string }[] = [];

  // Load master type options
  loadMasterTypeOptions() {
    this.masterTypeService.getAll().subscribe((types: any[]) => {
      // Filter by SERVICE_AREA key
      this.masterTypeOptions = (types || [])
        .filter(t => t.key === 'SERVICE_AREA')
        .map(t => ({ label: t.value, value: t.value }));
    });
  }

  // Filter service types based on department
  filterServiceType() {
    console.log("Debug: current selected enquiry value in filter service type", this.selectedEnquiry);
    if (!this.selectedEnquiry?.department || !this.allServiceTypes.length) {
      this.serviceTypeOptions = [];
      return;
    }

    console.log("DEBUG: enquiry service type options in filter service type,",this.allServiceTypes);
    const departmentName = this.selectedEnquiry.department;
    
    // First try exact match
    let filteredTypes = this.allServiceTypes.filter(st => 
      st.department_name === departmentName
    );

    // If no exact match, try case-insensitive match
    if (filteredTypes.length === 0) {
      filteredTypes = this.allServiceTypes.filter(st => 
        st.department_name?.toLowerCase() === departmentName.toLowerCase()
      );
    }

    // If still no match, show all service types
    if (filteredTypes.length === 0) {
      filteredTypes = this.allServiceTypes;
    }

    this.serviceTypeOptions = filteredTypes.map(st => ({
      label: `${st.code} - ${st.name}`,
      value: st.code
    }));

    // Clear selected service type if it's not in the filtered options
    const enquiry = this.selectedEnquiry;
    if (enquiry && enquiry.service_type && 
        !this.serviceTypeOptions.find(opt => opt.value === enquiry.service_type)) {
      enquiry.service_type = '';
    }
  }

  // Field validation methods (similar to tariff)
  onFieldChange(fieldName: string, value: any) {
    const error = this.validateField(fieldName, value);
    if (error) {
      this.fieldErrors[fieldName] = error;
    } else {
      delete this.fieldErrors[fieldName];
    }
  }

  validateField(fieldName: string, value: any): string {
    switch (fieldName) {
      case 'code':
        // Skip validation if auto-generation is enabled (not manual series)
        if (!this.isManualSeries) {
          return '';
        }
        if (!value || value.toString().trim() === '') {
          return 'Code is required';
        }
        if (this.selectedEnquiry?.isNew && this.isCodeDuplicate(value)) {
          return 'Code already exists';
        }
        break;
      case 'from_location':
        if (!value) {
          return 'From location is required';
        }
        break;
      case 'to_location':
        if (!value) {
          return 'To location is required';
        }
        break;
      case 'department':
        if (!value) {
          return 'Department is required';
        }
        break;
      case 'location_type_to':
        if (!value){
          return 'to Location type is required.';
        }
        break;
      case 'location_type_from':
        if (!value) {
          return 'From Location type is required';
        }
        break;
      // Add other field validations as needed
    }
    return '';
  }

  isCodeDuplicate(code: string): boolean {
    return this.enquiries.some(enquiry => 
      enquiry.code === code && enquiry.id !== this.selectedEnquiry?.id
    );
  }

  getFieldErrorClass(fieldName: string): string {
    return this.fieldErrors[fieldName] ? 'p-invalid' : '';
  }

  getFieldErrorStyle(fieldName: string): { [key: string]: string } {
    return this.fieldErrors[fieldName] ? { 'border-color': '#f44336' } : {};
  }

  // Master dialog methods
  openMaster(type: string) {
    // Prevent multiple clicks and show loading state
    if (this.masterDialogLoading[type]) {
      return;
    }
    this.masterDialogLoading[type] = true;
    // Open dialog immediately for better user experience
    if (type === 'from' || type === 'to') {
      this.showMasterLocationDialog = true;
    } else if (type === 'basis') {
      this.showBasisDialog = true;
    } else if (type === 'locationTypeFrom' || type === 'locationTypeTo') {
      this.masterTypeFilter = 'LOCATION';
      this.showMasterTypeDialog = true;
    } else if (type === 'masterType') {
      this.masterTypeFilter = 'SERVICE_AREA';
      this.showMasterTypeDialog = true;
    } else if (type === 'serviceArea') {
      this.showServiceAreaDialog = true;
    } else if (type === 'sourceSales') {
      this.showSourceSalesDialog = true;
    } else {
      this.messageService.add({ severity: 'info', summary: 'Open Master', detail: `Open ${type} master page` });
    }
    this.masterDialogLoading[type] = false;
    this.cdr.detectChanges();
  }

  closeMasterDialog(type: string) {
    console.log(`Closing master dialog: ${type}`);
    
    // Reset the appropriate dialog visibility
    switch (type) {
      case 'masterLocation':
        this.showMasterLocationDialog = false;
        // Reload locations so newly added entries appear in dropdowns
        this.loadLocations().subscribe({
          next: () => {
            // Re-apply filters based on current selection
            this.filterFromLocations();
            this.filterToLocations();
            this.cdr.detectChanges();
          },
          error: () => {
            // Even on error, attempt to refresh UI
            this.cdr.detectChanges();
          }
        });
        break;
      case 'basis':
        this.showBasisDialog = false;
        this.loadBasisOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges()
        });
        break;
      case 'serviceArea':
        this.showServiceAreaDialog = false;
        this.loadServiceAreaOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges()
        });
        break;
      case 'sourceSales':
        this.showSourceSalesDialog = false;
        this.loadSourceSalesOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges()
        });
        break;
      case 'masterType':
        this.showMasterTypeDialog = false;
        // Reload location types if the filter was for LOCATION
        if (this.masterTypeFilter === 'LOCATION') {
          this.loadLocationTypes().subscribe({
            next: () => {
              // Re-apply filters based on current selection
              this.filterFromLocations();
              this.filterToLocations();
              this.cdr.detectChanges();
            },
            error: () => {
              // Even on error, attempt to refresh UI
              this.cdr.detectChanges();
            }
          });
        }
        // Reset the filter
        this.masterTypeFilter = '';
        break;
      default:
        console.warn(`Unknown master dialog type: ${type}`);
    }
    
    // Reset loading state if it exists
    if (this.masterDialogLoading[type]) {
      this.masterDialogLoading[type] = false;
    }
    
    // Force change detection to ensure UI updates
    this.cdr.detectChanges();
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
      location_type_from: '',
      location_type_to: '',
      service_type: '',
      effective_date_from: today.toISOString().split('T')[0],
      effective_date_to: today.toISOString().split('T')[0],
      status: 'Open',
      remarks: '',
      line_items: [],
      isNew: true
    };
    
    // Initializing currentEnquiry to prevent undefined errors in functions like getSourcing()
    this.currentEnquiry = { ...this.selectedEnquiry };
    
    this.lineItems = [];
    this.vendorCards = [];
    this.activeVendorIndex = -1;
    this.isNewCustomer = false;
    this.fieldErrors = {};
    
    // Initialize customer selection
    this.selectedCustomer = null;
    this.customerContacts = [];
    this.selectedContact = null;
    this.showContactDropdown = false;
    
    // Reset manual entry flags
    this.isManualCompanyName = false;
    this.isManualName = false;
    this.isManualEmail = false;
    this.isManualMobile = false;
    this.isManualLandline = false;
    
    // Initialize masterDialogLoading state for ellipsis buttons
    this.masterDialogLoading = {};
    
    // Initialize date objects for calendar components
    this.selectedDate = today;
    this.selectedEffectiveDateFrom = today;
    this.selectedEffectiveDateTo = today;
    
    this.isDialogVisible = true;
  }

  editEnquiry(enquiry: Enquiry) {
    console.log("Debug: Editing the Enquiry",enquiry);
    this.loadEnquiry(enquiry.code!);
    // this.selectedEnquiry = { ...enquiry };
    // this.lineItems = enquiry.line_items || [];
    // this.vendorCards = enquiry.vendor_cards || [];
    
    // Set selected customer if company_name matches
    if (enquiry.company_name) {
      const matchingCustomer = this.customerOptions.find(c => 
        c.name === enquiry.company_name || c.display_name === enquiry.company_name
      );
      if (matchingCustomer && matchingCustomer.id) {
        this.selectedCustomer = matchingCustomer.id;
        this.loadCustomerContacts(matchingCustomer.id);
        this.isManualCompanyName = false;
        this.showContactDropdown = true;
        
        // Check if customer_name matches any contact, if not set to manual
        if (enquiry.customer_name) {
          // We'll check for matching contact after contacts are loaded
          this.isManualName = true; // Default to manual, will be updated in loadCustomerContacts if match found
        } else {
          this.isManualName = false;
        }
      } else {
        this.selectedCustomer = null;
        this.customerContacts = [];
        this.selectedContact = null;
        this.showContactDropdown = false;
        this.isManualCompanyName = true; // Show manual input for company name
        this.isManualName = true; // Show manual input for customer name
      }
    } else {
      this.selectedCustomer = null;
      this.customerContacts = [];
      this.selectedContact = null;
      this.showContactDropdown = false;
      this.isManualCompanyName = true; // Show manual input for company name
      this.isManualName = true; // Show manual input for customer name
    }
    
    // Set manual flags based on existing data
    this.isManualEmail = !!enquiry.email;
    this.isManualMobile = !!enquiry.mobile;
    this.isManualLandline = !!enquiry.landline;
    
    this.isDialogVisible = true;
  }

// load Line of Items for respective Enquiry
  loadEnquiry(enquiryCode: string){
    this.enquiryService.getEnquiryByCode(enquiryCode).subscribe({
      next: (enquiry: Enquiry) => {
        console.log("Debug Loaded Enquiry value for the enquiry code:",enquiryCode,"enquiry response",enquiry);
        this.selectedEnquiry = { ...enquiry };
        this.currentEnquiry = { ...enquiry };
        
        // Set Date objects for calendar components
        this.selectedDate = this.selectedEnquiry.date ? new Date(this.selectedEnquiry.date) : null;
        this.selectedEffectiveDateFrom = this.selectedEnquiry.effective_date_from ? new Date(this.selectedEnquiry.effective_date_from) : null;
        this.selectedEffectiveDateTo = this.selectedEnquiry.effective_date_to ? new Date(this.selectedEnquiry.effective_date_to) : null;
        
        this.lineItems = enquiry.line_items || [];
        this.vendorCards = enquiry.vendor_cards || [];
        
        // Process vendor cards to ensure charges are in proper format
        this.vendorCards = this.vendorCards.map(card => this.processVendorCardCharges(card));
        
        console.log('DEBUG loadEnquiry - vendor_cards from database:', enquiry.vendor_cards);
        console.log('DEBUG loadEnquiry - processed vendorCards:', this.vendorCards);
        if (this.vendorCards.length > 0) {
          console.log('DEBUG loadEnquiry - first vendor card charges:', this.vendorCards[0].charges);
          console.log('DEBUG loadEnquiry - first vendor card structure:', this.vendorCards[0]);
        }
        
        // Apply location filtering based on selected location types
        this.filterFromLocations();
        this.filterToLocations();
        
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

  viewEnquiry(enquiryCode: string) {
    this.loadEnquiry(enquiryCode);
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedEnquiry = null;
    this.lineItems = [];
    this.vendorCards = [];
    this.fieldErrors = {};
    
    // Clear customer selection
    this.selectedCustomer = null;
    this.customerContacts = [];
    this.selectedContact = null;
    this.showContactDropdown = false;
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

  onDateChange(date: Date | null) {
    if (this.selectedEnquiry && date) {
      this.selectedEnquiry.date = this.formatDateForAPI(date);
    }
  }

  onEffectiveDateFromChange(date: Date | null) {
    if (this.selectedEnquiry && date) {
      this.selectedEnquiry.effective_date_from = this.formatDateForAPI(date);
    }
  }

  onEffectiveDateToChange(date: Date | null) {
    if (this.selectedEnquiry && date) {
      this.selectedEnquiry.effective_date_to = this.formatDateForAPI(date);
    }
  }

  onCustomerSelect(event: any) {
    const customerId = event?.value;
    const customer = this.customerOptions.find(c => c.id === customerId);
    
    if (customer && customer.id && this.selectedEnquiry) {
      // Existing customer - set company and load contacts to decide autofill/dropdown
      this.selectedEnquiry.company_name = customer.name || customer.display_name;
      this.isNewCustomer = false;
      this.loadCustomerContacts(customer.id);
    } else {
      // No customer selected - clear fields
      if (this.selectedEnquiry) {
        this.selectedEnquiry.company_name = '';
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
        
        if (contacts && contacts.length > 0 && this.selectedEnquiry) {
          // Check if current enquiry data matches any contact
          const matchingContact = contacts.find(c => 
            c.name === this.selectedEnquiry?.customer_name ||
            c.email === this.selectedEnquiry?.email ||
            c.mobile === this.selectedEnquiry?.mobile ||
            c.landline === this.selectedEnquiry?.landline
          );
          
          if (contacts.length === 1) {
            // Single contact - check if enquiry data matches
            const only = contacts[0];
            this.showContactDropdown = false;
            
            if (matchingContact) {
              // Data matches, use contact data
              this.selectedContact = only;
              this.isManualName = false;
              this.isManualEmail = false;
              this.isManualMobile = false;
              this.isManualLandline = false;
            } else {
              // Data doesn't match, keep existing data and set manual flags

              this.selectedContact = null;
              this.isManualName = !!this.selectedEnquiry.customer_name;
              this.isManualEmail = !!this.selectedEnquiry.email;
              this.isManualMobile = !!this.selectedEnquiry.mobile;
              this.isManualLandline = !!this.selectedEnquiry.landline;
            }
          } else {
            // Multiple contacts
            this.showContactDropdown = true;
            
            if (matchingContact) {
              // Found matching contact
              this.selectedContact = matchingContact;
              this.onContactSelect({ value: matchingContact });
            } else {
              // No matching contact, try primary contact or set manual
              const primaryContact = contacts.find(c => c.is_primary);
              if (primaryContact && !this.selectedEnquiry.customer_name) {
                this.selectedContact = primaryContact;
                this.onContactSelect({ value: primaryContact });
              } else {
                // Keep existing data and set manual flags
                this.selectedContact = null;
                this.isManualName = !!this.selectedEnquiry.customer_name;
                this.isManualEmail = !!this.selectedEnquiry.email;
                this.isManualMobile = !!this.selectedEnquiry.mobile;
                this.isManualLandline = !!this.selectedEnquiry.landline;
              }
            }
          }
        } else {
          // No contacts found
          this.showContactDropdown = false;
          this.selectedContact = null;
                   this.isManualName = true;
          this.isManualEmail = true;
          this.isManualMobile = true;
          this.isManualLandline = true;
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

  // Manual entry toggle methods
  toggleManualCompanyName() {
    this.isManualCompanyName = !this.isManualCompanyName;
    
    if (this.isManualCompanyName) {
      // When switching to manual company name, enable manual entry for all contact fields
      this.isManualName = true;
      this.isManualEmail = true;
      this.isManualMobile = true;
      this.isManualLandline = true;
    } else if (this.selectedCustomer && this.selectedEnquiry) {
      // Reset to dropdown selection
      const customer = this.customerOptions.find(c => c.id === this.selectedCustomer);
      if (customer) {
        this.selectedEnquiry.company_name = customer.name || customer.display_name;
      }
      // When switching back to dropdown, disable manual entry for contact fields
      this.isManualName = false;
      this.isManualEmail = false;
      this.isManualMobile = false;
      this.isManualLandline = false;
    }
  }

  toggleManualName() {

    this.isManualName = !this.isManualName;
    if (!this.isManualName && this.selectedContact && this.selectedEnquiry) {
      // Reset to contact selection
      this.selectedEnquiry.customer_name = this.selectedContact.name || '';
    }
  }

  toggleManualEmail() {
    this.isManualEmail = !this.isManualEmail;
    if (!this.isManualEmail && this.selectedContact && this.selectedEnquiry) {
      // Reset to contact selection
      this.selectedEnquiry.email = this.selectedContact.email || '';
    }
  }

  toggleManualMobile() {
    this.isManualMobile = !this.isManualMobile;
    if (!this.isManualMobile && this.selectedContact && this.selectedEnquiry) {
      // Reset to contact selection
      this.selectedEnquiry.mobile = this.selectedContact.mobile || '';
    }
  }

  toggleManualLandline() {
    this.isManualLandline = !this.isManualLandline;
    if (!this.isManualLandline && this.selectedContact && this.selectedEnquiry) {
      // Reset to contact selection
      this.selectedEnquiry.landline = this.selectedContact.landline || '';
    }
  }


  // Line Items methods
  addLineItem() {
    const newItem: EnquiryLineItem = {
      s_no: this.lineItems.length + 1,
      quantity: 0,
      type:'',
      service_area:'',
      basis:  '',
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
    const firstBasis = this.lineItems[0]?.basis;
    const enq = this.selectedEnquiry;
    return !!(enq &&
              (enq.company_name || enq.customer_name) &&
              enq.from_location &&
              enq.to_location &&
              enq.effective_date_from &&
              enq.effective_date_to &&
              firstBasis &&
              this.lineItems.length > 0);
  }

  canGetTariff(): boolean {
    const firstBasis = this.lineItems[0]?.basis;
    const enq = this.selectedEnquiry;
    return !!(enq &&
              (enq.company_name || enq.customer_name) &&
              enq.from_location &&
              enq.to_location &&
              enq.effective_date_from &&
              enq.effective_date_to &&
              firstBasis &&
              this.lineItems.length > 0);
  }

  getSourcing() {
  

    if (!this.currentEnquiry?.code) {
      this.saveEnquiry(); 
      this.messageService.add({
        severity: 'info',
        summary: 'INFO',
        detail: 'Saved enquiry Successfully'
      });
      // return;
    }

    const enq = this.selectedEnquiry!;
    const criteria = {
      department: enq.department,
      from_location: enq.from_location,
      to_location: enq.to_location,
      effective_date_from: this.formatDateForAPI(enq.effective_date_from),
      effective_date_to: this.formatDateForAPI(enq.effective_date_to),
      basis: this.lineItems[0]?.basis,
      service_type: enq.service_type,
      from_location_type: enq.location_type_from,
      to_location_type: enq.location_type_to
    };

    this.enquiryService.getSourcingOptions(this.currentEnquiry?.code!, criteria).subscribe({
      next: (options) => {
        console.log("vendor list from get sourcing:",options);
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
  

    if (!this.currentEnquiry?.code) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please save the enquiry first before getting tariff options'
      });
      return;
    }

    const enq = this.selectedEnquiry!;
    const criteria = {
      department: enq.department,
      from_location: enq.from_location,
      to_location: enq.to_location,
      effective_date_from: this.formatDateForAPI(enq.effective_date_from),
      effective_date_to: this.formatDateForAPI(enq.effective_date_to),
      basis: this.lineItems[0]?.basis,
      service_type: enq.service_type,
      from_location_type: enq.location_type_from,
      to_location_type: enq.location_type_to
      
    };

    this.enquiryService.getTariffOptions(this.currentEnquiry.code, criteria).subscribe({
      next: (options) => {
        console.log("DEBUG get Tariff response options,",options);
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
    console.log("list of vendors selected from the sourcing:", this.selectedVendors);
    this.selectedVendors.forEach(vendor => {
      // Extract simple numeric charge value
      let chargeValue: number = 0;
      if (vendor.charges) {
        if (Array.isArray(vendor.charges) && vendor.charges.length > 0) {
          // If charges is an array, take the amount from the first charge
          chargeValue = parseFloat(vendor.charges[0].amount) || 0;
        } else if (typeof vendor.charges === 'string') {
          // If charges is a string, try to parse it as a number
          try {
            const parsed = JSON.parse(vendor.charges);
            if (Array.isArray(parsed) && parsed.length > 0) {
              chargeValue = parseFloat(parsed[0].amount) || 0;
            } else {
              chargeValue = parseFloat(vendor.charges) || 0;
            }
          } catch (e) {
            // If parsing fails, try to parse as direct number
            chargeValue = parseFloat(vendor.charges) || 0;
          }
        } else if (typeof vendor.charges === 'object' && !Array.isArray(vendor.charges) && (vendor.charges as any).amount) {
          // If charges is an object with amount property
          chargeValue = parseFloat((vendor.charges as any).amount) || 0;
        } else if (typeof vendor.charges === 'number') {
          // If charges is already a number
          chargeValue = vendor.charges;
        }
      }

      // Get vendor basis for quantity mapping
      const vendorBasis = (vendor as any).basis || '';
      
      // Map quantity from line items based on basis matching
      let mappedQuantity = 0;
      if (vendorBasis && this.lineItems && this.lineItems.length > 0) {
        // Find line items with matching basis (case-insensitive comparison)
        const matchingLineItems = this.lineItems.filter(lineItem => 
          lineItem.basis && lineItem.basis.toLowerCase() === vendorBasis.toLowerCase()
        );
        
        // Sum quantities from matching line items
        mappedQuantity = matchingLineItems.reduce((total, lineItem) => total + (lineItem.quantity || 0), 0);
      }

      const vendorCard: EnquiryVendorCard = {
        vendor_name: vendor.vendor_name,
        vendor_type: vendor.vendor_type,
        is_active: false,
        charges: chargeValue // Store as simple numeric value
        ,
        source_type: this.currentVendorSource,
        source_id: vendor.id,
        // Store additional sourcing details for display
        mode: vendor.mode,
        from_location: vendor.from_location,
        to_location: vendor.to_location,
        basis: vendorBasis,
        vendor_code: (vendor as any).vendor_code || '',
        effective_date: (vendor as any).effective_date || '',
        expiry_date: (vendor as any).expiry_date || (vendor as any).end_date || '',
        currency: (vendor as any).currency || 'N/A',
        quantity: mappedQuantity,
        remarks: ''
      };
      this.vendorCards.push(vendorCard);
    });

    console.log("DEBUG List of selected vendors stored in the vendorCards:", this.vendorCards);
    // Push the vendors list to the db for retrieval 
    this.saveVendorCards() 
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
    // update the is_active value from the 
    
  }

  processVendorCardCharges(card: EnquiryVendorCard): EnquiryVendorCard {
    // Process charges field - ensure it's a simple numeric value
    const charges = (card as any).charges; // Temporarily cast to any to handle mixed types
    
    if (charges !== undefined && charges !== null) {
      if (typeof charges === 'string') {
        try {
          const parsed = JSON.parse(charges);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Extract amount from first charge in array
            card.charges = parseFloat(parsed[0].amount) || 0;
          } else {
            // Try to parse as direct number
            card.charges = parseFloat(charges) || 0;
          }
        } catch (e) {
          // If parsing fails, try to parse as direct number
          card.charges = parseFloat(charges) || 0;
        }
      } else if (Array.isArray(charges) && charges.length > 0) {
        // Extract amount from first charge in array
        card.charges = parseFloat(charges[0].amount) || 0;
      } else if (typeof charges === 'object' && charges.amount) {
        // Extract amount from charge object
        card.charges = parseFloat(charges.amount) || 0;
      } else if (typeof charges === 'number') {
        // Already a number, keep as is
        card.charges = charges;
      } else {
        // Default to 0 if not a valid type
        card.charges = 0;
      }
    } else {
      card.charges = 0;
    }

    return card;
  }

  getDisplayCharges(card: EnquiryVendorCard): number {
    // Return simple charges value
    console.log('DEBUG getDisplayCharges for vendor:', card.vendor_name);
    console.log('DEBUG card.charges:', card.charges);
    
    // Return numeric value, default to 0 if not available
    const result = typeof card.charges === 'number' ? card.charges : 0;
    console.log('DEBUG returning charges value:', result);
    return result;
  }

  getVendorStatusClass(status: string | undefined): string {
    switch (status) {
      case 'Active': return 'text-green-600 font-semibold';
      case 'Inactive': return 'text-red-600 font-semibold';
      case 'Pending': return 'text-yellow-600 font-semibold';
      default: return 'text-gray-600 font-semibold';
    }
  }

  getVendorMode(card: EnquiryVendorCard): string {
    // Use the stored mode from sourcing selection
    return card.mode || 'N/A';
  }

  getVendorRoute(card: EnquiryVendorCard): string {
    // Use the stored from_location and to_location from sourcing selection
    const from = card.from_location || 'N/A';
    const to = card.to_location || 'N/A';
    return `${from} → ${to}`;
  }

  getVendorBasis(card: EnquiryVendorCard): string {
    // Use the stored basis from sourcing selection
    return card.basis || 'N/A';
  }

  formatQuantity(quantity: any): string {
    if (quantity === null || quantity === undefined || quantity === '') {
      return 'N/A';
    }
    
    // Convert to number and remove leading zeros
    const numValue = parseFloat(quantity);
    
    if (isNaN(numValue)) {
      return 'N/A';
    }
    
    // Format without unnecessary decimal places
    return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(2);
  }

  editVendorCard(card: EnquiryVendorCard, index: number) {
    // Open edit dialog for vendor card
    this.editingCard = { ...card };
    this.editingCardIndex = index;
    this.showEditVendorDialog = true;
  }

  saveVendorCardEdit() {
    if (this.editingCard && this.editingCardIndex >= 0) {
      // Update the vendor card with edited values
      this.vendorCards[this.editingCardIndex] = { ...this.editingCard };
      
      // Close the dialog
      this.showEditVendorDialog = false;
      this.editingCard = null;
      this.editingCardIndex = -1;
      
      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Vendor card updated successfully'
      });
    }
  }

  cancelVendorCardEdit() {
    this.showEditVendorDialog = false;
    this.editingCard = null;
    this.editingCardIndex = -1;
  }

  removeVendorCard(index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this vendor card?',
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.vendorCards.splice(index, 1);
        
        // Adjust active vendor index if needed
        if (this.activeVendorIndex === index) {
          this.activeVendorIndex = -1;
        } else if (this.activeVendorIndex > index) {
          this.activeVendorIndex--;
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Vendor card removed successfully'
        });
      }
    });
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

    console.log("DEBUG: selected enquiry value from save enquiry",this.selectedEnquiry);

    const enquiryData: Enquiry = {
      ...this.selectedEnquiry,
      line_items: this.lineItems,
      is_new_customer: this.isNewCustomer,
      date: this.formatDateForAPI(this.selectedEnquiry.date),
      effective_date_from: this.formatDateForAPI(this.selectedEnquiry.effective_date_from),
      effective_date_to: this.formatDateForAPI(this.selectedEnquiry.effective_date_to),
      name: this.authService.getUserName()!
    };

    // For automatic series, ensure code is empty so backend generates it (only for new records)
    if (!this.isManualSeries && this.selectedEnquiry.isNew) {
      enquiryData.code = '';
    }

    const saveOperation = this.selectedEnquiry.id 
      ? this.enquiryService.updateEnquiry(this.selectedEnquiry.code!, enquiryData)
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
          console.log("Save Enquiry hide dialog",this.selectedEnquiry);
          // this.hideDialog();
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
    console.log("DEBUG: values params in canConfirmEnquiry,",this.enquiryForm,"lineItems,",this.lineItems,"vendor cards,",this.vendorCards,"Current Enquiry,",this.currentEnquiry);
    // this.enquiryForm.valid && 
    return this.lineItems.length > 0 && 
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

    console.log("Save vendor cards vendor Cards list,",this.vendorCards);

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
            location_type_from: '',
            location_type_to: '',
            service_type: '',
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
          // Do not pre-fill code for auto series; keep empty until save
        },
        error: () => {
          this.isManualSeries = true;
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

  private resolveLocationName(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.location_name || value.name || '';
  }

  // Location type change handlers
  onLocationTypeFromChange(value: any) {
    this.onFieldChange('location_type_from', value);
    
    // Clear the from location when location type changes
    if (this.selectedEnquiry) {
      this.selectedEnquiry.from_location = '';
      this.fieldErrors['from_location'] = '';
      
      // Filter from locations based on selected location type
      this.filterFromLocations();
    }
  }

  onLocationTypeToChange(value: any) {
    this.onFieldChange('location_type_to', value);
    
    // Clear the to location when location type changes
    if (this.selectedEnquiry) {
      this.selectedEnquiry.to_location = '';
      this.fieldErrors['to_location'] = '';
      
      // Filter to locations based on selected location type
      this.filterToLocations();
    }
  }

  // Location filtering methods
  filterFromLocations() {
    console.log('Filtering from locations for type:', this.selectedEnquiry);
    console.log('All locations:', this.allLocations);
    
    if (this.selectedEnquiry?.location_type_from) {
      // Debug: Log all location types to see what's available
      const availableTypes = [...new Set(this.allLocations.map(l => l.type))];
      console.log('Available location types in data:', availableTypes);
      
      const filteredLocations = this.allLocations.filter(l => {
        console.log(`Comparing location type '${l.type}' with selected '${this.selectedEnquiry!.location_type_from}'`);
        return l.type === this.selectedEnquiry!.location_type_from;
      });
      console.log('Filtered from locations:', filteredLocations.length);
      
      // If no exact match, try case-insensitive comparison
      if (filteredLocations.length === 0) {
        const caseInsensitiveFiltered = this.allLocations.filter(l => 
          l.type?.toLowerCase() === this.selectedEnquiry!.location_type_from?.toLowerCase()
        );
        console.log('Case-insensitive filtered locations:', caseInsensitiveFiltered.length);
        
        this.fromLocationOptions = caseInsensitiveFiltered.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
      } else {
        this.fromLocationOptions = filteredLocations.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
      }
    } else {
      // If no location type selected, show all locations formatted as CODE - NAME
      this.fromLocationOptions = this.allLocations.map(l => ({
        label: `${l.code} - ${l.name}`,
        value: l.code
      }));
    }
    console.log('From location options:', this.fromLocationOptions.length);
  }

  filterToLocations() {
    console.log('Filtering to locations for type:', this.selectedEnquiry?.location_type_to);
    console.log('All locations:', this.allLocations.length);
    
    if (this.selectedEnquiry?.location_type_to) {
      // Debug: Log all location types to see what's available
      const availableTypes = [...new Set(this.allLocations.map(l => l.type))];
      console.log('Available location types in data:', availableTypes);
      
      const filteredLocations = this.allLocations.filter(l => {
        console.log(`Comparing location type '${l.type}' with selected '${this.selectedEnquiry!.location_type_to}'`);
        return l.type === this.selectedEnquiry!.location_type_to;
      });
      console.log('Filtered to locations:', filteredLocations.length);
      
      // If no exact match, try case-insensitive comparison
      if (filteredLocations.length === 0) {
        const caseInsensitiveFiltered = this.allLocations.filter(l => 
          l.type?.toLowerCase() === this.selectedEnquiry!.location_type_to?.toLowerCase()
        );
        console.log('Case-insensitive filtered locations:', caseInsensitiveFiltered.length);
        
        this.toLocationOptions = caseInsensitiveFiltered.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
      } else {
        this.toLocationOptions = filteredLocations.map(l => ({
          label: `${l.code} - ${l.name}`,
          value: l.code
        }));
      }
    } else {
      // If no location type selected, show all locations formatted as CODE - NAME
      this.toLocationOptions = this.allLocations.map(l => ({
        label: `${l.code} - ${l.name}`,
        value: l.code
      }));
    }
    console.log('To location options:', this.toLocationOptions.length);
  }
}