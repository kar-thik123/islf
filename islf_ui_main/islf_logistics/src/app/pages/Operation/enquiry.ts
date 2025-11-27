import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import {
  ConfirmationService,
  MessageService,
  MenuItem,
  TreeNode,
} from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { AccordionModule } from 'primeng/accordion';
import {
  EnquiryService,
  Enquiry,
  EnquiryLineItem,
  EnquiryVendorCard,
  CustomerDropdown,
  CustomerContact,
  SourcingOption,
  TariffOption,
  EnquirySummary,
} from '../../services/enquiry.service';
import { ContextService } from '../../services/context.service';
import { MappingService } from '../../services/mapping.service';
import { NumberSeriesService } from '../../services/number-series.service';
import { MasterLocationService } from '../../services/master-location.service';
import { DepartmentService } from '../../services/department.service';
import { BasisService } from '../../services/basis.service';
import { MasterItemService } from '../../services/master-item.service';
import { ServiceTypeService } from '../../services/servicetype.service';
import { MasterTypeService } from '../../services/mastertype.service';
import { CurrencyCodeService } from '../../services/currencycode.service';
import { CarriageService } from '../../services/carriage.service';
import { AuthService } from '../../services/auth.service';
import { MasterLocationComponent } from '../masters/masterlocation';
import { BasisComponent } from '../masters/basis';
import { MasterTypeComponent } from '../masters/mastertype';
import { forkJoin, from } from 'rxjs';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  ServiceAreaService,
  ServiceArea,
} from '../../services/service-area.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ServiceAreaComponent } from '../masters/servicearea';
import { SourceSalesService } from '@/services/source-sales.service';
import { SourceService } from '../../services/sourcing.service';
import { SourceSalesComponent } from '../masters/sourceSales';
import { CargoTypeMasterComponent } from '../masters/cargotype';
import { CurrencyCodeComponent } from '../masters/currencycode';
import { TabViewModule } from 'primeng/tabview';
import { VendorService } from '@/services/vendor.service';
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
    SourceSalesComponent,
    CargoTypeMasterComponent,
    CurrencyCodeComponent,
    MenuModule,
    TreeTableModule,
    TabViewModule,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>
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
        [globalFilterFields]="[
          'enquiry_no',
          'customer_name',
          'company_name',
          'department',
          'service_type',
          'from_location',
          'to_location',
          'status'
        ]"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div
            class="flex justify-between items-center flex-col sm:flex-row gap-2"
          >
            <div class="flex gap-2">
              <button
                pButton
                type="button"
                label="Create Enquiry"
                icon="pi pi-plus"
                (click)="addEnquiry()"
              ></button>
            </div>
            <div class="flex gap-2">
              <span class="p-input-icon-left">
                <input
                  pInputText
                  type="text"
                  (input)="
                    dt.filterGlobal($any($event.target).value, 'contains')
                  "
                  placeholder="Search..."
                />
              </span>
            </div>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Enquiry No
                <p-columnFilter
                  type="text"
                  field="enquiry_no"
                  display="menu"
                  placeholder="Search by enquiry no"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Date
                <p-columnFilter
                  type="date"
                  field="date"
                  display="menu"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Customer Name
                <p-columnFilter
                  type="text"
                  field="customer_name"
                  display="menu"
                  placeholder="Search by customer"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Customer Name
                <p-columnFilter
                  type="text"
                  field="company_name"
                  display="menu"
                  placeholder="Search by Customer Name"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Department
                <p-columnFilter
                  type="text"
                  field="department"
                  display="menu"
                  placeholder="Search by department"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Service Type
                <p-columnFilter
                  type="text"
                  field="service_type"
                  display="menu"
                  placeholder="Search by service type"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                From Location
                <p-columnFilter
                  type="text"
                  field="from_location"
                  display="menu"
                  placeholder="Search by from location"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                To Location
                <p-columnFilter
                  type="text"
                  field="to_location"
                  display="menu"
                  placeholder="Search by to location"
                ></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Status
                <p-columnFilter
                  field="status"
                  matchMode="equals"
                  display="menu"
                >
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
                        <span class="font-semibold text-sm">{{
                          option.label
                        }}</span>
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
            <td>{{ enquiry.customer_name }}</td>
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
              <button
                pButton
                icon="pi pi-pencil"
                (click)="editEnquiry(enquiry)"
                class="p-button-sm"
              ></button>
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
      [style]="{ width: '95vw', maxWidth: '1700px', height: '90vh' }"
      [contentStyle]="{ overflow: 'auto', maxHeight: '75vh' }"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div
          *ngIf="selectedEnquiry"
          class="p-fluid form-grid dialog-body-padding"
        >
          <!-- General Enquiry Details -->
          <div class="section-header">General Enquiry Details</div>
          <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1"
                >Code <span class="text-red-500">*</span></label
              >
              <input
                id="code"
                pInputText
                [(ngModel)]="selectedEnquiry.code"
                (ngModelChange)="onFieldChange('code', selectedEnquiry.code)"
                [ngClass]="getFieldErrorClass('code')"
                [ngStyle]="getFieldErrorStyle('code')"
                [disabled]="!isManualSeries || !selectedEnquiry.isNew"
                [placeholder]="
                  isManualSeries
                    ? 'Enter enquiry code'
                    : mappedEnquirySeriesCode || 'Auto-generated'
                "
                class="w-full"
              />
              <small
                *ngIf="fieldErrors['code']"
                class="p-error text-red-500 text-xs ml-2"
                >{{ fieldErrors['code'] }}</small
              >
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Enquiry Type</label>
              <p-dropdown
                [(ngModel)]="selectedEnquiry.enquiry_type"
                [options]="enquiryTypeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Enquiry Type"
                [showClear]="true"
                class="w-full"
              >
              </p-dropdown>
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
                    class="w-full"
                  >
                    <ng-template let-customer pTemplate="item">
                      <div>
                        <div class="font-semibold">{{ customer.name }}</div>
                        <div class="text-sm text-gray-500">
                          {{ customer.company_name || customer.name }}
                        </div>
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
                    class="w-full"
                  />
                </div>
                <button
                  pButton
                  type="button"
                  [icon]="isManualCompanyName ? 'pi pi-list' : 'pi pi-pencil'"
                  (click)="toggleManualCompanyName()"
                  [pTooltip]="
                    isManualCompanyName
                      ? 'Switch to dropdown'
                      : 'Switch to manual entry'
                  "
                  class="p-button-sm p-button-outlined"
                ></button>
              </div>
              <small
                *ngIf="fieldErrors['company_name']"
                class="p-error text-red-500 text-xs ml-2"
                >{{ fieldErrors['company_name'] }}</small
              >
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Name</label>
              <div class="flex gap-2">
                <div class="flex-1">
                  <div
                    *ngIf="
                      showContactDropdown && !isManualName;
                      else manualNameInput
                    "
                  >
                    <p-dropdown
                      id="name"
                      [(ngModel)]="selectedContact"
                      [options]="customerContacts"
                      optionLabel="name"
                      placeholder="Select contact person"
                      (onChange)="onContactSelect($event)"
                      class="w-full"
                    >
                      <ng-template let-contact pTemplate="item">
                        <div>
                          <div class="font-semibold">{{ contact.name }}</div>
                          <div class="text-sm text-gray-500">
                            {{ contact.department }}
                          </div>
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
                      class="w-full"
                    />
                  </ng-template>
                </div>
                <button
                  pButton
                  type="button"
                  [icon]="isManualName ? 'pi pi-list' : 'pi pi-pencil'"
                  (click)="toggleManualName()"
                  [pTooltip]="
                    isManualName
                      ? 'Switch to dropdown'
                      : 'Switch to manual entry'
                  "
                  class="p-button-sm p-button-outlined"
                  [disabled]="!showContactDropdown && !isManualName"
                ></button>
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
                  class="flex-1"
                />
                <button
                  pButton
                  type="button"
                  [icon]="isManualEmail ? 'pi pi-lock' : 'pi pi-pencil'"
                  (click)="toggleManualEmail()"
                  [pTooltip]="
                    isManualEmail ? 'Lock to auto-fill' : 'Enable manual entry'
                  "
                  class="p-button-sm p-button-outlined"
                ></button>
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
                  class="flex-1"
                />
                <button
                  pButton
                  type="button"
                  [icon]="isManualMobile ? 'pi pi-lock' : 'pi pi-pencil'"
                  (click)="toggleManualMobile()"
                  [pTooltip]="
                    isManualMobile ? 'Lock to auto-fill' : 'Enable manual entry'
                  "
                  class="p-button-sm p-button-outlined"
                ></button>
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
                  class="flex-1"
                />
                <button
                  pButton
                  type="button"
                  [icon]="isManualLandline ? 'pi pi-lock' : 'pi pi-pencil'"
                  (click)="toggleManualLandline()"
                  [pTooltip]="
                    isManualLandline
                      ? 'Lock to auto-fill'
                      : 'Enable manual entry'
                  "
                  class="p-button-sm p-button-outlined"
                ></button>
              </div>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Cargo Type</label>
              <div class="flex gap-2">
                <p-dropdown
                  appendTo="body"
                  [options]="cargoTypeOptions"
                  [(ngModel)]="selectedEnquiry.cargo_type"
                  placeholder="Select Cargo Type"
                  [filter]="true"
                  filterBy="label"
                  [showClear]="true"
                  class="flex-1"
                >
                </p-dropdown>
                <button
                  pButton
                  [icon]="
                    masterDialogLoading['cargoType']
                      ? 'pi pi-spin pi-spinner'
                      : 'pi pi-ellipsis-h'
                  "
                  class="p-button-sm"
                  [disabled]="masterDialogLoading['cargoType']"
                  (click)="openMaster('cargoType')"
                ></button>
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
                  class="flex-1"
                >
                </p-dropdown>
                <button
                  pButton
                  [icon]="
                    masterDialogLoading['locationTypeFrom']
                      ? 'pi pi-spin pi-spinner'
                      : 'pi pi-ellipsis-h'
                  "
                  class="p-button-sm"
                  [disabled]="masterDialogLoading['locationTypeFrom']"
                  (click)="openMaster('locationTypeFrom')"
                ></button>
              </div>
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1"
                >From Location <span class="text-red-500">*</span></label
              >
              <div class="flex gap-2">
                <p-dropdown
                  appendTo="body"
                  [options]="fromLocationOptions"
                  [(ngModel)]="selectedEnquiry.from_location"
                  (ngModelChange)="
                    onFieldChange(
                      'from_location',
                      selectedEnquiry.from_location
                    )
                  "
                  [ngClass]="getFieldErrorClass('from_location')"
                  [ngStyle]="getFieldErrorStyle('from_location')"
                  placeholder="Select From Location"
                  [filter]="true"
                  filterBy="label"
                  [showClear]="true"
                  class="flex-1"
                >
                </p-dropdown>
                <button
                  pButton
                  [icon]="
                    masterDialogLoading['from']
                      ? 'pi pi-spin pi-spinner'
                      : 'pi pi-ellipsis-h'
                  "
                  class="p-button-sm"
                  [disabled]="masterDialogLoading['from']"
                  (click)="openMaster('from')"
                ></button>
              </div>
              <small
                *ngIf="fieldErrors['from_location']"
                class="p-error text-red-500 text-xs ml-2"
                >{{ fieldErrors['from_location'] }}</small
              >
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
                  class="flex-1"
                >
                </p-dropdown>
                <button
                  pButton
                  [icon]="
                    masterDialogLoading['locationTypeTo']
                      ? 'pi pi-spin pi-spinner'
                      : 'pi pi-ellipsis-h'
                  "
                  class="p-button-sm"
                  [disabled]="masterDialogLoading['locationTypeTo']"
                  (click)="openMaster('locationTypeTo')"
                ></button>
              </div>
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1"
                >To Location <span class="text-red-500">*</span></label
              >
              <div class="flex gap-2">
                <p-dropdown
                  appendTo="body"
                  [options]="toLocationOptions"
                  [(ngModel)]="selectedEnquiry.to_location"
                  (ngModelChange)="
                    onFieldChange('to_location', selectedEnquiry.to_location)
                  "
                  [ngClass]="getFieldErrorClass('to_location')"
                  [ngStyle]="getFieldErrorStyle('to_location')"
                  placeholder="Select To Location"
                  [filter]="true"
                  filterBy="label"
                  [showClear]="true"
                  class="flex-1"
                >
                </p-dropdown>
                <button
                  pButton
                  [icon]="
                    masterDialogLoading['to']
                      ? 'pi pi-spin pi-spinner'
                      : 'pi pi-ellipsis-h'
                  "
                  class="p-button-sm"
                  [disabled]="masterDialogLoading['to']"
                  (click)="openMaster('to')"
                ></button>
              </div>
              <small
                *ngIf="fieldErrors['to_location']"
                class="p-error text-red-500 text-xs ml-2"
                >{{ fieldErrors['to_location'] }}</small
              >
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Department</label>
              <p-dropdown
                [options]="departmentOptions"
                [(ngModel)]="selectedEnquiry.department"
                (ngModelChange)="
                  onFieldChange('department', selectedEnquiry.department);
                  filterServiceType()
                "
                [ngClass]="getFieldErrorClass('department')"
                [ngStyle]="getFieldErrorStyle('department')"
                placeholder="Select Department"
                [filter]="true"
                filterBy="label"
                [showClear]="true"
                class="w-full"
              >
              </p-dropdown>
              <small
                *ngIf="fieldErrors['department']"
                class="p-error text-red-500 text-xs ml-2"
                >{{ fieldErrors['department'] }}</small
              >
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1">Service Type</label>
              <p-dropdown
                [options]="serviceTypeOptions"
                [(ngModel)]="selectedEnquiry.service_type"
                (ngModelChange)="
                  onFieldChange('service_type', selectedEnquiry.service_type)
                "
                [ngClass]="getFieldErrorClass('service_type')"
                [ngStyle]="getFieldErrorStyle('service_type')"
                placeholder="Select Service Type"
                [filter]="true"
                filterBy="label"
                [showClear]="true"
                class="w-full"
              >
              </p-dropdown>
              <small
                *ngIf="fieldErrors['service_type']"
                class="p-error text-red-500 text-xs ml-2"
                >{{ fieldErrors['service_type'] }}</small
              >
            </div>

            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1"
                >Effective Date From</label
              >
              <p-calendar
                id="effective_date_from"
                [(ngModel)]="selectedEffectiveDateFrom"
                (ngModelChange)="onEffectiveDateFromChange($event)"
                [showIcon]="true"
                dateFormat="dd-mm-yy"
                appendTo="body"
                placeholder="Select Effective Date From"
                [showTime]="false"
                [timeOnly]="false"
              >
              </p-calendar>
              <small
                *ngIf="fieldErrors['effective_date_from']"
                class="p-error text-red-500 text-xs ml-2"
                >{{ fieldErrors['effective_date_from'] }}</small
              >
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
                [timeOnly]="false"
              >
              </p-calendar>
              <small
                *ngIf="fieldErrors['effective_date_to']"
                class="p-error text-red-500 text-xs ml-2"
                >{{ fieldErrors['effective_date_to'] }}</small
              >
            </div>
            <div class="col-span-12 md:col-span-3">
              <label class="block font-semibold mb-1"
                >Source/Sales Person</label
              >
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
                  class="flex-1"
                >
                </p-dropdown>
                <button
                  pButton
                  [icon]="
                    masterDialogLoading['sourceSales']
                      ? 'pi pi-spin pi-spinner'
                      : 'pi pi-ellipsis-h'
                  "
                  class="p-button-sm"
                  [disabled]="masterDialogLoading['sourceSales']"
                  (click)="openMaster('sourceSales')"
                ></button>
              </div>
              <small *ngIf="fieldErrors['sourceSalesCode']" class="p-error">{{
                fieldErrors['sourceSalesCode']
              }}</small>
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
                class="w-full"
              >
              </p-dropdown>
            </div>
            <div class="col-span-12 md:col-span-6">
              <label class="block font-semibold mb-1">Remarks</label>
              <textarea
                id="remarks"
                pInputTextarea
                [(ngModel)]="selectedEnquiry.remarks"
                rows="3"
                placeholder="Enter remarks"
                class="w-full"
              ></textarea>
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
                [timeOnly]="false"
              >
              </p-calendar>
              <small
                *ngIf="fieldErrors['date']"
                class="p-error text-red-500 text-xs ml-2"
                >{{ fieldErrors['date'] }}</small
              >
            </div>

            <div class="col-span-12">
              <div class="section-header">
                <h3>Carriage List</h3>
              </div>
              <div class="mb-3 flex items-center gap-2">
                <button
                  pButton
                  type="button"
                  label="Add carriage"
                  icon="pi pi-plus"
                  (click)="addCarriageRow()"
                  class="p-button-sm"
                ></button>
              </div>
              <p-table
                [value]="carriageMappings"
                dataKey="id"
                [paginator]="false"
                styleClass="p-datatable-sm"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th style="min-width: 260px;">Carriage</th>
                    <th style="min-width: 260px;">Location Type</th>
                    <th style="min-width: 260px;">Location</th>
                    <th style="min-width: 80px;">Delete</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-row let-i="rowIndex">
                  <tr>
                    <td>
                      <p-dropdown
                        [(ngModel)]="row.carriage"
                        [options]="carriageOptionsAll"
                        appendTo="body"
                        [filter]="true"
                        filterBy="label"
                        [showClear]="true"
                        (onChange)="onCarriageChanged(row, $event.value)"
                        [style.width.px]="260"
                      ></p-dropdown>
                    </td>
                    <td>
                      <p-dropdown
                        [(ngModel)]="row.location_type"
                        [options]="locationTypeFromOptions"
                        appendTo="body"
                        [showClear]="true"
                        [style.width.px]="260"
                      ></p-dropdown>
                    </td>
                    <td>
                      <p-dropdown
                        [(ngModel)]="row.location"
                        [options]="getLocationsForType(row.location_type)"
                        appendTo="body"
                        [filter]="true"
                        filterBy="label"
                        [showClear]="true"
                        [style.width.px]="260"
                      ></p-dropdown>
                    </td>
                    <td>
                      <button
                        pButton
                        type="button"
                        icon="pi pi-trash"
                        class="p-button-danger p-button-text"
                        (click)="removeCarriageRow(i)"
                      ></button>
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="4" class="text-center py-4">
                      No carriage rows. Click Add.
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </div>

          <!-- Line Items Section -->
          <div class="section-header">
            <h3>Line Items (Enquiry Details)</h3>
          </div>
          <div class="grid-container">
            <div class="mb-3 flex items-center gap-2">
              <button
                pButton
                type="button"
                label="Add Line Item"
                icon="pi pi-plus"
                (click)="addLineItem()"
                class="p-button-sm"
              ></button>
              <button
                pButton
                type="button"
                label="Preview"
                icon="pi pi-eye"
                (click)="showEnquiryPreview()"
                class=" p-button-sm"
              ></button>
              <p-button
                *ngIf="finalizedVendors && finalizedVendors.length > 0"
                label="View Finalized Vendors ({{ finalizedVendors.length }})"
                icon="pi pi-list"
                (click)="showFinalizedVendorsDialog = true"
                styleClass="p-button-info p-button-sm"
              ></p-button>
            </div>

            <p-table
              [value]="lineItems"
              dataKey="s_no"
              [responsive]="true"
              [paginator]="false"
              [(selection)]="selectedLineItems"
              styleClass="p-datatable-sm line-items-table"
              [scrollable]="true"
              (selectionChange)="onSelectionLineItemChange($event)"
              scrollHeight="400px"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th style="width: 3%"><p-tableHeaderCheckbox /></th>
                  <!-- Checkbox -->
                  <th style="width: 5%">S.No.</th>
                  <th style="width: 15%">Type</th>
                  <th style="width: 15%">Service Area</th>
                  <th style="width: 15%">Basis</th>
                  <th style="width: 15%">From Type</th>
                  <th style="width: 15%">From</th>
                  <th style="width: 15%">To Type</th>
                  <th style="width: 15%">To</th>
                  <th style="width: 15%">Actions</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item let-i="rowIndex">
                <tr>
                  <td>
                    <p-tableCheckbox [value]="item" />
                  </td>
                  <td>{{ i + 1 }}</td>
                  <td>
                    <div class="flex gap-2">
                      <p-dropdown
                        [(ngModel)]="item.type"
                        [options]="masterTypeOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select type"
                        class="flex-1"
                        appendTo="body"
                        (onChange)="onLineItemTypeChange(item)"
                      >
                      </p-dropdown>
                      <button
                        pButton
                        [icon]="
                          masterDialogLoading['masterType']
                            ? 'pi pi-spin pi-spinner'
                            : 'pi pi-ellipsis-h'
                        "
                        class="p-button-sm"
                        [disabled]="masterDialogLoading['masterType']"
                        (click)="openMaster('masterType')"
                        appendTo="body"
                      ></button>
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <p-dropdown
                        [(ngModel)]="item.service_area"
                        [options]="getServiceAreasForType(item.type)"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Select service area"
                        class="flex-1"
                        appendTo="body"
                      >
                      </p-dropdown>
                      <button
                        pButton
                        [icon]="
                          masterDialogLoading['serviceArea']
                            ? 'pi pi-spin pi-spinner'
                            : 'pi pi-ellipsis-h'
                        "
                        class="p-button-sm"
                        [disabled]="masterDialogLoading['serviceArea']"
                        (click)="openMaster('serviceArea')"
                        appendTo="body"
                      ></button>
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
                        appendTo="body"
                      >
                      </p-dropdown>
                      <button
                        pButton
                        [icon]="
                          masterDialogLoading['basis']
                            ? 'pi pi-spin pi-spinner'
                            : 'pi pi-ellipsis-h'
                        "
                        class="p-button-sm"
                        [disabled]="masterDialogLoading['basis']"
                        (click)="openMaster('basis')"
                        appendTo="body"
                      ></button>
                    </div>
                  </td>
                  <td>
                    <p-dropdown
                      [(ngModel)]="item.line_from_location_type"
                      [options]="locationTypeFromOptions"
                      appendTo="body"
                      [showClear]="true"
                    ></p-dropdown>
                  </td>
                  <td>
                    <p-dropdown
                      [(ngModel)]="item.line_from_location"
                      [options]="getLocationsForType(item.line_from_location_type)"
                      appendTo="body"
                      [filter]="true"
                      filterBy="label"
                      [showClear]="true"
                    ></p-dropdown>
                  </td>
                  <td>
                    <p-dropdown
                      [(ngModel)]="item.line_to_location_type"
                      [options]="locationTypeToOptions.length ? locationTypeToOptions : locationTypeFromOptions"
                      appendTo="body"
                      [showClear]="true"
                    ></p-dropdown>
                  </td>
                  <td>
                    <p-dropdown
                      [(ngModel)]="item.line_to_location"
                      [options]="getLocationsForType(item.line_to_location_type)"
                      appendTo="body"
                      [filter]="true"
                      filterBy="label"
                      [showClear]="true"
                    ></p-dropdown>
                  </td>
                  <td style="width: 300px; min-width: 300px">
                    <div class="flex gap-1 action-buttons">
                      <button
                        pButton
                        type="button"
                        label="Sourcing"
                        icon="pi pi-search"
                        (click)="getSourcing(i + 1)"
                        class="sourcing-btn"
                        pTooltip="Query Sourcing Table with matching conditions"
                      ></button>

                      <!--<button
                        pButton
                        icon="pi pi-pencil"
                        (click)="editLineItem(i)"
                        class="p-button-warning p-button-sm p-button-text"
                        pTooltip="Edit Row"
                      ></button>
                      <button
                        pButton
                        icon="pi pi-trash"
                        (click)="deleteLineItem(i)"
                        class="p-button-danger p-button-sm p-button-text"
                        pTooltip="Delete Row"
                      ></button> -->
                    </div>
                  </td>
                </tr>
              </ng-template>
              <!-- In the line item expanded row template -->
              <ng-template #expandedrow let-item>
                <tr>
                  <td colspan="10"></td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="6" class="text-center py-4">
                    No line items added yet. Click "Add Line Item" to start.
                  </td>
                </tr>
              </ng-template>
            </p-table>

            <!-- commenting out for now -->
            <!-- Action Buttons -->
            <!--<div class="flex gap-2 mt-4 pt-3 border-t">
              <button
                pButton
                type="button"
                label="Get Sourcing"
                icon="pi pi-search"
                (click)="getSourcing()"
                class="p-button-info"
                pTooltip="Query Sourcing Table with matching conditions"
              ></button>
              <button
                pButton
                type="button"
                label="Get Tariff"
                icon="pi pi-calculator"
                (click)="getTariff()"
                class="p-button-secondary"
                pTooltip="Fetch directly from Tariff Table"
              ></button>
            </div> -->
          </div>
          <!-- Final Actions -->
          <div *ngIf="vendorCards.length > 0" class="border-t pt-4">
            <h3 class="text-lg font-semibold mb-3">Final Actions</h3>
            <div class="flex gap-2">
              <button
                pButton
                type="button"
                label="Get Mail"
                icon="pi pi-envelope"
                (click)="generateMail()"
                [disabled]="!canGenerateMail()"
                class="p-button-sm"
                pTooltip="Generate Mail Template based on Active Vendor Card + Customer Details"
              ></button>
              <button
                pButton
                type="button"
                label="Save"
                icon="pi pi-save"
                (click)="saveEnquiry()"
                class="p-button-success"
                pTooltip="Save enquiry to Enquiry Table"
              ></button>
              <button
                pButton
                type="button"
                label="Confirm Enquiry"
                icon="pi pi-check-circle"
                (click)="confirmEnquiry()"
                [disabled]="!canConfirmEnquiry()"
                class="p-button-sm"
                pTooltip="Save all details into Booking Table. If customer is new, also save to Customer Table."
              ></button>
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
              class="p-button-sm"
              size="small"
            >
            </p-button>
            <p-button
              *ngIf="!selectedEnquiry?.id"
              label="Save Draft"
              icon="pi pi-save"
              (click)="saveEnquiry()"
              class="p-button-sm"
              size="small"
            >
            </p-button>
            <p-button
              *ngIf="selectedEnquiry?.id"
              label="Update"
              icon="pi pi-check"
              (click)="saveEnquiry()"
              class="p-button-sm"
              size="small"
            >
            </p-button>
          </div>
        </div>
      </ng-template>
    </p-dialog>

    <!-- Mail Preview Dialog -->
    <p-dialog
      header="Mail Preview"
      [(visible)]="showMailDialog"
      [modal]="true"
      [style]="{ width: '70vw' }"
      [maximizable]="true"
    >
      <div class="mail-preview">
        <pre>{{ mailContent }}</pre>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Close"
          icon="pi pi-times"
          (onClick)="showMailDialog = false"
          class="p-button-text"
        >
        </p-button>
        <p-button
          label="Copy to Clipboard"
          icon="pi pi-copy"
          (onClick)="copyMailToClipboard()"
        >
        </p-button>
      </ng-template>
    </p-dialog>

    <!-- Sub Charges Dialog -->
    <p-dialog
      header="Sub Charges"
      [(visible)]="chargesDialogVisible"
      [modal]="true"
      [style]="{ width: '60vw' }"
    >
      <ng-template pTemplate="content">
        <p-table
          [value]="chargesDialogVendor?.sub_charges || []"
          dataKey="id"
          styleClass="p-datatable-sm"
          selectionMode="multiple"
          [(selection)]="chargesDialogVendor.selected_subcharges"
        >
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
              <th>Charge Name</th>
              <th>Basis</th>
              <th>Currency</th>
              <th>Charges</th>
              <th>GST/VAT</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-charge>
            <tr>
              <td><p-tableCheckbox [value]="charge" /></td>
              <td>{{ charge.charge_name }}</td>
              <td>{{ charge.basis }}</td>
              <td>{{ charge.currency }}</td>
              <td>{{ charge.charges }}</td>
              <td>{{ charge.gst_vat }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center py-3">
                No sub charges available
              </td>
            </tr>
          </ng-template>
        </p-table>
      </ng-template>
      <ng-template pTemplate="footer">
        <p-button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          (onClick)="chargesDialogVisible = false"
        ></p-button>
        <p-button
          label="Save"
          icon="pi pi-check"
          (onClick)="saveSelectedSubCharges()"
        ></p-button>
      </ng-template>
    </p-dialog>
    <!-- Vendor Tabs Dialog -->
    <p-dialog
      header="Vendor Selection"
      [(visible)]="showVendorTabsDialog"
      [modal]="true"
      [style]="{ width: '95vw', height: '90vh' }"
      [maximizable]="true"
    >
      <p-tabView [(activeIndex)]="activeVendorTab">
        <!-- Get Sourcing Tab -->
        <p-tabPanel header="Get Sourcing">
          <div class="p-fluid">
            <p-table
              #sourcingTable
              [value]="sourcingVendors"
              [paginator]="true"
              [rows]="10"
              dataKey="id"
              [(selection)]="sourcingSelection"
              selectionMode="single"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th style="width: 3rem"></th>
                  <th style="width: 3rem"></th>
                  <th>Vendor Name</th>
                  <th>Vendor Type</th>
                  <th>Dept (Mode)</th>
                  <th>Route</th>
                  <th>Cargo Type</th>
                  <th>Basis</th>
                  <th>Charges Count</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-vendor let-expanded="expanded">
                <tr>
                  <td>
                    <p-tableRadioButton [value]="vendor"></p-tableRadioButton>
                  </td>
                  <td>
                    <p-button
                      type="button"
                      pRipple
                      [pRowToggler]="vendor"
                      [text]="true"
                      severity="secondary"
                      [rounded]="true"
                      [icon]="
                        expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'
                      "
                    />
                  </td>
                  <td>
                    <!-- <button
                      pButton
                      type="button"
                      class="p-button-text p-button-sm mr-2"
                      [icon]="
                        vendor.showCharges
                          ? 'pi pi-chevron-down'
                          : 'pi pi-chevron-right'
                      "
                      (click)="toggleVendorChargesInline(vendor, 'sourcing')"
                      pTooltip="Expand Sub Charges"
                    ></button> -->
                    {{ getVendorName(vendor.vendor_name) }}
                  </td>
                  <td>{{ vendor.vendor_type }}</td>
                  <td>{{ vendor.mode }}</td>
                  <td>
                    {{ getLocationName(vendor.from_location) }} →
                    {{ getLocationName(vendor.to_location) }}
                  </td>
                  <td>{{ vendor.cargo_type }}</td>
                  <td>{{ vendor.basis }}</td>
                  <td>
                    {{ vendor.sub_charges ? vendor.sub_charges.length : 0 }}
                  </td>
                </tr>
              </ng-template>
              <ng-template #expandedrow let-vendor>
                <tr>
                  <td colspan="6">
                    <div class="p-4">
                      <h5>
                        subcharges for vendor
                        {{ getVendorName(vendor.vendor_name) }}
                      </h5>
                      <p-table
                        [value]="vendor.sub_charges || []"
                        [(selection)]="vendor.selected_subcharges"
                        dataKey="id"
                      >
                        <ng-template pTemplate="header">
                          <tr>
                            <th style="width: 4rem">
                              <p-tableHeaderCheckbox />
                            </th>
                            <th style="width: 30%">Charge Name</th>
                            <th style="width: 20%">Basis</th>
                            <th style="width: 15%">Currency</th>
                            <th style="width: 15%">Charges</th>

                            <th style="width: 17%">GST/VAT</th>
                          </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-charge>
                          <tr>
                            <td>
                              <p-tableCheckbox
                                [value]="charge"
                              ></p-tableCheckbox>
                            </td>
                            <td class="pl-4">
                              {{ charge.charge_name || charge.name }}
                            </td>
                            <td>{{ charge.basis }}</td>
                            <td>{{ charge.currency }}</td>
                            <td>{{ charge.amount || charge.charges }}</td>

                            <td>
                              {{
                                charge.gst_vat ||
                                  charge.gst_rate ||
                                  charge.vat_rate ||
                                  '0'
                              }}%
                            </td>
                          </tr>
                        </ng-template>
                      </p-table>
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="8" class="text-center py-4">
                    No sourcing vendors found for the current criteria.
                  </td>
                </tr>
              </ng-template>
            </p-table>

            <div class="flex justify-between items-center mt-4">
              <div class="text-sm text-gray-600">
                Showing {{ sourcingVendors.length }} vendors
              </div>
              <button
                pButton
                label="Move to Select Sourcing"
                icon="pi pi-arrow-right"
                (click)="moveToSelectSourcing()"
                [disabled]="!sourcingSelection"
                class="p-button-primary"
              ></button>
            </div>
          </div>
        </p-tabPanel>

        <!-- Select Sourcing Tab -->
        <p-tabPanel header="Select Sourcing">
          <div class="p-fluid">
            <div
              *ngIf="selectedSourcingVendors.length === 0"
              class="p-4 text-center border-round bg-gray-50"
            >
              <p class="text-gray-500">No vendors selected for sourcing yet.</p>
            </div>

            <div
              *ngFor="let vendor of selectedSourcingVendors; let i = index"
              class="mb-6 p-4 border-round border-1"
            >
              <div class="flex justify-between items-center">
                <h4>{{ getVendorName(vendor.vendor_name) }} - Charges</h4>
                <button
                  pButton
                  type="button"
                  icon="pi pi-trash"
                  class="p-button-danger p-button-text"
                  (click)="removeSelectedSourcingVendor(vendor)"
                  pTooltip="Remove Vendor"
                ></button>
                <button
                  pButton
                  type="button"
                  label="Get Tariff"
                  icon="pi pi-download"
                  class="p-button-primary p-button-text"
                  (click)="getTariffForVendor(vendor)"
                  pTooltip="Fetch tariff for this vendor"
                ></button>
              </div>

              <p-table [value]="vendor.sub_charges || []">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Charge Name</th>
                    <th>Basis</th>
                    <th>Currency</th>
                    <th>Charges</th>
                    <th>GST/VAT</th>

                    <th>Sell Rate Currency</th>
                    <th>Sell Rate</th>
                    <th>GST/VAT</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-charge>
                  <tr>
                    <td>{{ charge.charge_name || charge.name }}</td>
                    <td>{{ charge.basis }}</td>
                    <td>{{ charge.currency }}</td>
                    <td>{{ charge.amount || charge.charges }}</td>
                    <td>
                      {{
                        charge.gst_vat ||
                          charge.gst_rate ||
                          charge.vat_rate ||
                          '0'
                      }}%
                    </td>
                    <td>
                      <ng-container
                        *ngIf="charge.selected; else sellRateCurrencyDash"
                      >
                        <div class="flex gap-2 items-center">
                          <p-dropdown
                            appendTo="body"
                            [options]="sellPriceCurrencyOptions"
                            [(ngModel)]="charge.sell_rate_currency"
                            placeholder="Select Currency"
                            [filter]="true"
                            filterBy="label"
                            [showClear]="true"
                            class="small-dropdown"
                          ></p-dropdown>
                          <button
                            pButton
                            [icon]="
                              masterDialogLoading['currencyCode']
                                ? 'pi pi-spin pi-spinner'
                                : 'pi pi-ellipsis-h'
                            "
                            class="p-button-sm"
                            [disabled]="masterDialogLoading['currencyCode']"
                            (click)="openMaster('currencyCode')"
                          ></button>
                        </div>
                      </ng-container>
                      <ng-template #sellRateCurrencyDash>--</ng-template>
                    </td>
                    <td>
                      <input
                        *ngIf="charge.selected"
                        type="number"
                        pInputText
                        [(ngModel)]="vendor.sell_rates[charge.id]"
                        [value]="charge.amount || charge.charges"
                        style="width: 100px"
                      />
                      <span *ngIf="!charge.selected">--</span>
                    </td>
                    <td>
                      <p-inputnumber
                        [(ngModel)]="charge.sell_rate_gst_vat"
                        inputId="percent"
                        suffix="%"
                      />
                    </td>
                  </tr>
                </ng-template>
              </p-table>

              <div class="mt-3">
                <label class="block font-semibold mb-1">Remarks</label>
                <textarea
                  pInputTextarea
                  [(ngModel)]="vendor.remarks"
                  rows="2"
                  style="width: 100%"
                  placeholder="Enter remarks for this vendor"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end mt-4">
              <button
                pButton
                label="Save Sourcing"
                icon="pi pi-save"
                (click)="saveSourcingVendors()"
                [disabled]="selectedSourcingVendors.length === 0"
                class="p-button-success"
              ></button>
            </div>
          </div>
        </p-tabPanel>

        <!-- Get Tariff Tab -->
        <p-tabPanel header="Get Tariff">
          <div class="p-fluid">
            <!-- Manual filtering controls for tariff only -->
            <div class="grid grid-cols-12 gap-4 mb-4">
              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1"
                  >Filter by Service Area</label
                >
                <p-dropdown
                  [(ngModel)]="tariffFilter.service_area"
                  [options]="serviceAreaDropdownOptions"
                  [showClear]="true"
                  placeholder="All Service Areas"
                  (onChange)="applyManualTariffFilter()"
                ></p-dropdown>
              </div>
              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1"
                  >Filter by From Location Type</label
                >
                <p-dropdown
                  [(ngModel)]="tariffFilter.from_location_type"
                  [options]="locationTypeFromOptions"
                  [showClear]="true"
                  placeholder="All From Locations Type"
                  (onChange)="applyManualTariffFilter()"
                ></p-dropdown>
              </div>
              <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1"
                  >Filter by From Location</label
                >
                <p-dropdown
                  [(ngModel)]="tariffFilter.from_location"
                  [options]="getLocationsForType(tariffFilter.from_location_type)"
                  [showClear]="true"
                  placeholder="All From Locations"
                  (onChange)="applyManualTariffFilter()"
                ></p-dropdown>
              </div>
               <div class="col-span-12 md:col-span-3">
                <label class="block font-semibold mb-1"
                  >Filter by To Location Type</label
                >
                <p-dropdown
                  [(ngModel)]="tariffFilter.to_location_type"
                  [options]="locationTypeToOptions"
                  [showClear]="true"
                  placeholder="All To Locations Type"
                  (onChange)="applyManualTariffFilter()"
                ></p-dropdown>
              </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block font-semibold mb-1"
              >Filter by To Location</label
            >
            <p-dropdown
              [(ngModel)]="tariffFilter.to_location"
              [options]="getLocationsForType(tariffFilter.to_location_type)"
              [showClear]="true"
              placeholder="All To Locations"
              (onChange)="applyManualTariffFilter()"
            ></p-dropdown>
          </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block font-semibold mb-1">Filter by Department</label>
            <p-dropdown
              [(ngModel)]="tariffFilter.department"
              [options]="departmentOptions"
              [showClear]="true"
              placeholder="All Departments"
              (onChange)="onTariffDepartmentFilterChange(); applyManualTariffFilter()"
            ></p-dropdown>
          </div>
          <div class="col-span-12 md:col-span-3">
            <label class="block font-semibold mb-1">Filter by Service Type</label>
            <p-dropdown
              [(ngModel)]="tariffFilter.service_type"
              [options]="serviceTypeFilterOptions"
              [filter]="true"
              filterBy="label"
              [showClear]="true"
              placeholder="All Service Types"
              (onChange)="applyManualTariffFilter()"
            ></p-dropdown>
          </div>
          
        </div>
            <p-table
              #tariffTable
              [value]="filteredTariffVendors"
              [paginator]="true"
              [rows]="10"
              dataKey="id"
              selectionMode="multiple"
              [(selection)]="selectedTariffSelection"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th style="width: 3rem">
                    <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
                  </th>
                  <th>Vendor Name</th>
                  <th>Vendor Type</th>
                  <th>Dept (Mode)</th>
                  <th>Route</th>
                  <th>Cargo Type</th>
                  <th>Basis</th>
                  <th>Sub Charges</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-vendor>
                <tr>
                  <td>
                    <p-tableCheckbox [value]="vendor"></p-tableCheckbox>
                  </td>
                  <td>
                    <button
                      pButton
                      type="button"
                      class="p-button-text p-button-sm mr-2"
                      [icon]="
                        vendor.showCharges
                          ? 'pi pi-chevron-down'
                          : 'pi pi-chevron-right'
                      "
                      (click)="toggleVendorChargesInline(vendor, 'tariff')"
                      pTooltip="Expand Sub Charges"
                    ></button>
                    {{ getVendorName(vendor.vendor_name) }}
                  </td>
                  <td>{{ vendor.vendor_type }}</td>
                  <td>{{ vendor.mode }}</td>
                  <td>
                    {{ getLocationName(vendor.from_location) }} →
                    {{ getLocationName(vendor.to_location) }}
                  </td>
                  <td>{{ vendor.cargo_type }}</td>
                  <td>{{ vendor.basis }}</td>
                  <td>
                    {{ vendor.sub_charges ? vendor.sub_charges.length : 0 }}
                  </td>
                </tr>
                <tr *ngIf="vendor.showCharges">
                  <td colspan="8" class="bg-blue-50 p-2 border-round">
                    <p-table [value]="vendor.sub_charges || []">
                      <ng-template pTemplate="header">
                        <tr>
                          <th style="width: 3rem">Select</th>
                          <th style="width: 30%">Charge Name</th>
                          <th style="width: 20%">Basis</th>
                          <th style="width: 15%">Currency</th>
                          <th style="width: 15%">Charges</th>

                          <th style="width: 17%">GST/VAT</th>
                        </tr>
                      </ng-template>
                      <ng-template pTemplate="body" let-charge>
                        <tr>
                          <td>
                            <p-checkbox
                              [(ngModel)]="charge.selected"
                              [binary]="true"
                              (onChange)="toggleTariffSubcharge(vendor, charge)"
                            ></p-checkbox>
                          </td>
                          <td class="pl-4">
                            {{ charge.charge_name || charge.name }}
                          </td>
                          <td>{{ charge.basis }}</td>
                          <td>{{ charge.currency }}</td>
                          <td>{{ charge.amount || charge.charges }}</td>

                          <td>
                            {{
                              charge.gst_vat ||
                                charge.gst_rate ||
                                charge.vat_rate ||
                                '0'
                            }}%
                          </td>
                        </tr>
                      </ng-template>
                    </p-table>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="8" class="text-center py-4">
                    No tariff vendors match the current filters.
                  </td>
                </tr>
              </ng-template>
            </p-table>

            <div class="flex justify-between items-center mt-4">
              <div class="text-sm text-gray-600">
                Showing {{ filteredTariffVendors.length }} of
                {{ tariffVendors.length }} vendors
              </div>
              <div class="flex gap-2">
                <button
                  pButton
                  label="Clear Filters"
                  icon="pi pi-filter-slash"
                  (click)="clearTariffFilters()"
                  class="p-button-secondary"
                ></button>
                <button
                  pButton
                  label="Move to Select Tariff"
                  icon="pi pi-arrow-right"
                  (click)="moveToSelectTariff()"
                  [disabled]="!hasSelectedFilteredTariffVendors"
                  class="p-button-primary"
                ></button>
              </div>
            </div>
          </div>
        </p-tabPanel>

        <!-- Select Tariff Tab -->
        <p-tabPanel header="Select Tariff">
          <div class="p-fluid">
            <div
              *ngIf="selectedTariffVendors.length === 0"
              class="p-4 text-center border-round bg-gray-50"
            >
              <p class="text-gray-500">No vendors selected for tariff yet.</p>
            </div>

            <div
              *ngFor="let vendor of selectedTariffVendors; let i = index"
              class="mb-6 p-4 border-round border-1"
            >
              <div class="flex justify-between items-center">
                <h4>{{ getVendorName(vendor.vendor_name) }} - Charges</h4>
                <button
                  pButton
                  type="button"
                  icon="pi pi-trash"
                  class="p-button-danger p-button-text"
                  (click)="removeSelectedTariffVendor(vendor)"
                  pTooltip="Remove Vendor"
                ></button>
              </div>

              <p-table [value]="vendor.sub_charges || []">
                <ng-template pTemplate="header">
                  <tr>
                    <th colspan="5" class="text-left">Buy Rate</th>
                    <th colspan="3" class="text-left">Sell Rate</th>
                  </tr>
                  <tr>
                    <th>Charge Name</th>
                    <th>Basis</th>
                    <th>Currency</th>
                    <th>Charges</th>
                    <th>GST/VAT</th>
                    <th>Sell Rate Currency</th>
                    <th>Sell Rate</th>
                    <th>GST/VAT</th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-charge>
                  <tr>
                    <td>{{ charge.charge_name || charge.name }}</td>
                    <td>{{ charge.basis }}</td>
                    <td>{{ charge.currency }}</td>
                    <td>{{ charge.amount || charge.charges }}</td>
                    <td>
                      {{
                        charge.gst_vat ||
                          charge.gst_rate ||
                          charge.vat_rate ||
                          '0'
                      }}%
                    </td>
                    <td>
                      <ng-container *ngIf="true">
                        <div class="flex gap-2 items-center">
                          <p-dropdown
                            appendTo="body"
                            [options]="sellPriceCurrencyOptions"
                            [(ngModel)]="charge.sell_rate_currency"
                            placeholder="Select Currency"
                            [filter]="true"
                            filterBy="label"
                            [showClear]="true"
                            class="small-dropdown"
                          ></p-dropdown>
                          <button
                            pButton
                            [icon]="
                              masterDialogLoading['currencyCode']
                                ? 'pi pi-spin pi-spinner'
                                : 'pi pi-ellipsis-h'
                            "
                            class="p-button-sm"
                            [disabled]="masterDialogLoading['currencyCode']"
                            (click)="openMaster('currencyCode')"
                          ></button>
                        </div>
                      </ng-container>
                    </td>
                    <td>
                      <input
                        type="number"
                        pInputText
                        [(ngModel)]="vendor.sell_rates[charge.id]"
                        [value]="charge.amount || charge.charges"
                        style="width: 100px"
                      />
                    </td>
                    <td>
                      <p-inputnumber
                        [(ngModel)]="charge.sell_rate_gst_vat"
                        inputId="percent"
                        suffix="%"
                      />
                    </td>
                  </tr>
                </ng-template>
              </p-table>

              <div class="mt-3">
                <label class="block font-semibold mb-1">Remarks</label>
                <textarea
                  pInputTextarea
                  [(ngModel)]="vendor.remarks"
                  rows="2"
                  style="width: 100%"
                  placeholder="Enter remarks for this vendor"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end mt-4">
              <button
                pButton
                label="Save Tariff"
                icon="pi pi-save"
                (click)="saveTariffVendors()"
                [disabled]="selectedTariffVendors.length === 0"
                class="p-button-success"
              ></button>
            </div>
          </div>
        </p-tabPanel>
      </p-tabView>
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
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
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
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
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
    <!--Cargo Type Dialog -->
    <p-dialog
      header="Cargo Type Master"
      [(visible)]="showCargoTypeDialog"
      [modal]="true"
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('cargoType')"
      [closeOnEscape]="true"
    >
      <ng-template pTemplate="content">
        <cargo-type></cargo-type>
      </ng-template>
    </p-dialog>

    <!-- Currency Code Dialog -->
    <p-dialog
      header="Currency Code Master"
      [(visible)]="showCurrencyCodeDialog"
      [modal]="true"
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
      [contentStyle]="{ overflow: 'visible' }"
      [baseZIndex]="10000"
      [closable]="true"
      [draggable]="false"
      [resizable]="false"
      (onHide)="closeMasterDialog('currencyCode')"
      [closeOnEscape]="true"
    >
      <ng-template pTemplate="content">
        <currency-code></currency-code>
      </ng-template>
    </p-dialog>

    <!--Master Type Dialog-->
    <p-dialog
      header="Service Type Master"
      [(visible)]="showServiceTypeDialog"
      [modal]="true"
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
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
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
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
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
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
      [style]="{
        width: 'auto',
        minWidth: '60vw',
        maxWidth: '95vw',
        height: 'auto',
        maxHeight: '90vh'
      }"
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
    <!-- Enquiry Preview Dialog -->
    <p-dialog
      [(visible)]="showPreviewDialog"
      header="Enquiry Preview "
      [modal]="true"
      [style]="{ width: '95vw', maxHeight: '90vh' }"
      [draggable]="false"
      [resizable]="false"
    >
      <div class="p-4 preview-container">
        <h3 class="text-xl font-bold mb-4">Enquiry Summary</h3>

        <!-- General Enquiry Details -->
        <div class="mb-6 p-4 border rounded bg-gray-50">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p>
                <span class="font-semibold">Enquiry Code:</span>
                {{ selectedEnquiryPreview?.code || '--' }}
              </p>
              <p>
                <span class="font-semibold">Customer:</span>
                {{ selectedEnquiryPreview?.customer_name || '--' }}
              </p>
              <p>
                <span class="font-semibold">Company:</span>
                {{ currentEnquiry?.company_name || '--' }}
              </p>
              <p>
                <span class="font-semibold">From:</span>
                {{ selectedEnquiryPreview?.from_location || '--' }}
              </p>
              <p>
                <span class="font-semibold">To:</span>
                {{ selectedEnquiryPreview?.to_location || '--' }}
              </p>
            </div>
            <div>
              <p>
                <span class="font-semibold">Service Type:</span>
                {{ selectedEnquiryPreview?.service_type || '--' }}
              </p>
              <p>
                <span class="font-semibold">Cargo Type:</span>
                {{ selectedEnquiryPreview?.cargo_type || '--' }}
              </p>
              <p>
                <span class="font-semibold">Department:</span>
                {{ selectedEnquiryPreview?.department || '--' }}
              </p>
              <p>
                <span class="font-semibold">Status:</span>
                {{ selectedEnquiryPreview?.status || '--' }}
              </p>
              <p>
                <span class="font-semibold">Date:</span>
                {{ formatDate(selectedEnquiryPreview?.date) || '--' }}
              </p>
              <p>
                <span class="font-semibold">Date:</span>
                {{ formatDate(currentEnquiry?.date) || '--' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Line Items Display with Finalized Vendors Only -->
        <h4 class="text-lg font-bold mb-4">Line Items</h4>
        <div class="mb-6">
          <div class="grid grid-cols-1 gap-6">
            <div
              *ngFor="
                let item of this.selectedEnquiryPreview?.line_items;
                let i = index
              "
              class="line-item-card p-4 border rounded-lg bg-white shadow-sm"
            >
              <!-- Line Item Header -->
              <div class="flex justify-between items-start mb-4 pb-3 border-b">
                <div>
                  <h5 class="font-bold text-lg">Line Item {{ i + 1 }}</h5>
                  <p class="text-sm text-gray-600">
                    {{ item.type || 'No type specified' }}
                  </p>
                </div>
                <div class="text-right">
                  <span
                    class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                    [ngClass]="{
                      'bg-green-100 text-green-800': item.status === 'Active',
                      'bg-gray-100 text-gray-800': item.status === 'Inactive',
                      'bg-yellow-100 text-yellow-800': item.status === 'Pending'
                    }"
                  >
                    {{ item.status || 'Active' }}
                  </span>
                </div>
              </div>

              <!-- Line Item Details - Horizontal Layout -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div class="detail-item">
                  <label class="font-semibold text-sm text-gray-600"
                    >Service Area</label
                  >
                  <p class="mt-1">{{ item.service_area || '--' }}</p>
                </div>
                <div class="detail-item">
                  <label class="font-semibold text-sm text-gray-600"
                    >Basis</label
                  >
                  <p class="mt-1">{{ item.basis || '--' }}</p>
                </div>
                <div class="detail-item">
                  <label class="font-semibold text-sm text-gray-600"
                    >Quantity</label
                  >
                  <p class="mt-1">{{ item.quantity || 0 }}</p>
                </div>
                <div class="detail-item">
                  <label class="font-semibold text-sm text-gray-600"
                    >Remarks</label
                  >
                  <p class="mt-1">{{ item.remarks || '--' }}</p>
                </div>
              </div>

              <!-- Finalized Sourcing/Tariff Lists -->
              <div class="mt-4">
                <div class="space-y-4">
                  <div
                    *ngFor="
                      let summary of item?.enquiry_summary;
                      let idx = index
                    "
                    class="source-section"
                  >
                    <h6 class="font-semibold mb-2 text-green-700 capitalize">
                      {{ summary.summary_type }} Vendor's List
                    </h6>
                    <!-- Finalized Vendors List -->
                    <div class="source-list-container">
                      <p-table
                        [value]="summary.selected_source_items || []"
                        styleClass="p-datatable-sm w-full source-list-table"
                      >
                        <ng-template pTemplate="header">
                          <tr>
                            <th style="width: 120px">Source No</th>
                            <th style="width: 200px">Vendor Name</th>
                            <th style="width: 100px">Currency</th>
                            <th style="width: 120px">Charge</th>
                            <th style="width: 150px">Sourced Time</th>
                            <th style="width: 250px">Remarks</th>
                          </tr>
                        </ng-template>
                        <ng-template
                          pTemplate="body"
                          let-source
                          let-i="rowIndex"
                        >
                          <tr>
                            <!-- <td>{{ getSourceNumber(source, i) }}</td> -->
                            <td>{{ source.sourced_no }}</td>
                            <td class="font-medium">
                              {{ source.vendor_name }}
                            </td>
                            <td>
                              {{
                                source.currency || source.currency_code || '--'
                              }}
                            </td>
                            <td>
                              <span class="font-semibold">
                                {{ source.charge || source.charges || '--' }}
                              </span>
                            </td>
                            <td>
                              {{
                                formatDateTime(source.created_at) ||
                                  source.sourced_time ||
                                  '--'
                              }}
                            </td>
                            <td class="remarks-cell">
                              {{
                                source.remarks ||
                                  source.negotiated_remarks ||
                                  '--'
                              }}
                            </td>
                          </tr>
                        </ng-template>
                        <ng-template pTemplate="emptymessage">
                          <tr>
                            <td
                              colspan="6"
                              class="text-center p-4 text-gray-500"
                            >
                              No finalized {{ summary.summary_type }} items
                              available
                            </td>
                          </tr>
                        </ng-template>
                      </p-table>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Finalized Sources Message -->
              <!-- <div
                *ngIf="item?.enquiry_summary?.[0]?.selected_source_items?.length ===0 ||
                item?.enquiry_summary?.[0]?.selected_source_items"
                class="mt-4 p-4 text-center border rounded bg-gray-50"
              >
                <p class="text-gray-500">
                  No vendors available for this line item.
                </p>
              </div> -->
            </div>
          </div>
        </div>

        <!-- No Line Items with Finalized Vendors Message -->
        <div
          *ngIf="
            !this.selectedEnquiryPreview?.line_items ||
            this.selectedEnquiryPreview?.line_items?.length === 0
          "
          class="p-8 text-center border rounded bg-gray-50"
        >
          <p class="text-gray-500 text-lg">
            No line items with vendors available for preview.
          </p>
        </div>

        <!-- Finalized Vendors Summary -->
        <div
          *ngIf="finalizedVendors && finalizedVendors.length > 0"
          class="mt-6"
        >
          <h4 class="text-lg font-bold mb-3">Finalized Vendors Summary</h4>
          <div class="p-4 border rounded bg-blue-50">
            <p class="font-semibold">
              Total Vendors: {{ finalizedVendors.length }}
            </p>
            <button
              pButton
              label="View Detailed List"
              icon="pi pi-list"
              (click)="showFinalizedVendorsDialog = true"
              class="p-button-sm p-button-info mt-2"
            ></button>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-between items-center">
          <div>
            <button
              pButton
              label="Close"
              icon="pi pi-times"
              (click)="showPreviewDialog = false"
              class="p-button-sm"
            ></button>
          </div>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      /* Preview Dialog Styles */
      .preview-container {
        max-height: calc(90vh - 100px);
        overflow-y: auto;
      }

      .line-item-card {
        transition: all 0.3s ease;
      }

      .line-item-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .detail-item {
        padding: 8px 0;
      }

      .source-section {
        border-left: 3px solid #3b82f6;
        padding-left: 12px;
      }

      .source-list-container {
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        overflow: hidden;
      }

      .source-list-table .p-datatable-wrapper {
        border-radius: 6px;
      }

      .source-list-table .p-datatable-thead > tr > th {
        background-color: #f8fafc;
        color: #374151;
        font-weight: 600;
        padding: 12px;
        border-bottom: 2px solid #e5e7eb;
      }

      .source-list-table .p-datatable-tbody > tr > td {
        padding: 12px;
        vertical-align: top;
      }

      .source-list-table .p-datatable-tbody > tr:hover {
        background-color: #f9fafb;
      }

      .remarks-cell {
        max-width: 250px;
        word-wrap: break-word;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .detail-item {
          border-bottom: 1px solid #f3f4f6;
          padding: 12px 0;
        }

        .detail-item:last-child {
          border-bottom: none;
        }
      }
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

      /* Expanded tree table styles */
      .expanded-line-item-container {
        min-width: 1200px;
        overflow-x: auto;
      }

      .expanded-summary-table {
        min-width: 1100px;
      }

      .expanded-summary-table .p-datatable-wrapper {
        overflow-x: auto;
      }

      .expanded-source-container {
        min-width: 1000px;
        overflow-x: auto;
      }

      .expanded-source-table {
        min-width: 1000px;
      }

      .expanded-source-table .p-datatable-wrapper {
        overflow-x: auto;
      }

      /* Ensure proper width for nested tables */
      .p-datatable .p-datatable .p-datatable-wrapper {
        min-width: 100%;
      }

      /* Make the main table container wider */
      .grid-container {
        overflow-x: auto;
      }

      /* Style for the main line items table */
      .p-datatable-sm .p-datatable-wrapper {
        overflow-x: auto;
      }

      /* Ensure dialog content can scroll horizontally if needed */
      .dialog-body-padding {
        overflow-x: auto;
      }
    `,
  ],
})
export class EnquiryComponent implements OnInit {
  showServiceAreaDialog = false;
  serviceAreaDropdownOptions: { label: string; value: string }[] = [];
  // Tree Table Properties
  openTreeIndex: number = -1;
  value = '';
  vendorTreeNodesByLine: { [index: number]: TreeNode[] } = {};
  selectedTreeKeysByLine: { [index: number]: { [key: string]: boolean } } = {};
  vendorNodeMapByLine: { [index: number]: { [key: string]: any } } = {};

  // Finalized vendors preview
  finalizedVendors: any[] = [];
  showFinalizedVendorsDialog: boolean = false;
  showPreviewDialog: boolean = false;

  selectedServiceArea: string = '';
  enquiryForm!: FormGroup;
  lineItems: EnquiryLineItem[] = [];

  // selected LineItem Array
  selectedLineItems: EnquiryLineItem[] = [];

  // enquirySummaryList: EnquirySummary[] = [
  //   {
  //     master_type: 'sourcing',
  //     selected_no: 0,
  //     vendor_name: '',
  //     charge: 0,
  //   },
  //   {
  //     master_type: 'tariff',
  //     selected_no: 0,
  //     vendor_name: '',
  //     charge: 0,
  //   },
  // ];

  vendorCards: EnquiryVendorCard[] = [];
  allLocations: any[] = [];
  allVendors: any[] = [];
  sourceSalesOptions: any[] = [];
  showSourceSalesDialog = false;
  // Table data
  enquiries: Enquiry[] = [];
  selectedEnquiry: Enquiry | null = null;
  selectedEnquiryPreview: Enquiry | null = null;

  isDialogVisible = false;
  fieldErrors: { [key: string]: string } = {};

  // Options
  statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Confirmed', value: 'Confirmed' },
  ];

  lineItemStatusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Pending', value: 'Pending' },
  ];

  // Location options
  locationOptions: any[] = [];
  fromLocationOptions: any[] = [];
  toLocationOptions: any[] = [];

  // Department options
  departmentOptions: any[] = [];

  // Cargo Type options
  cargoTypeOptions: any[] = [];

  // Basis options
  basisOptions: any[] = [];
  serviceAreaOptions: any[] = [];
  serviceAreaOptionsRaw: any[] = [];

  // Service type options
  serviceTypeOptions: any[] = [];
  allServiceTypes: any[] = [];
  serviceTypeFilterOptions: any[] = [];
  
  departmentNameToCode: Map<string, string> = new Map();

  // Enquiry type options
  enquiryTypeOptions = [
    { label: 'Direct', value: 'Direct' },
    { label: 'Nomination', value: 'Nomination' },
  ];

  carriageMappings: any[] = [];
  carriageOptionsFrom: any[] = [];
  carriageOptionsTo: any[] = [];
  carriageOptionsAll: any[] = [];

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
    { label: 'Road', value: 'Road' },
  ];

  currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'INR', value: 'INR' },
    { label: 'AED', value: 'AED' },
  ];

  // Customer dropdown
  customerOptions: CustomerDropdown[] = [];
  selectedCustomer: any = null;

  // Master dialog states
  showMasterLocationDialog = false;
  showBasisDialog = false;
  showMasterTypeDialog = false;
  showCargoTypeDialog = false;
  showCurrencyCodeDialog = false;

  showServiceTypeDialog = false;
  masterTypeFilter = '';
  masterDialogLoading: { [key: string]: boolean } = {
    sourceSales: false,
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
  // showEditVendorDialog = false;
  showMailDialog = false;

  // Vendor management
  availableVendors: (SourcingOption | TariffOption)[] = [];
  selectedVendors: (SourcingOption | TariffOption)[] = [];
  selectedVendorType = {};
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

  //       11/15/2025
  // New properties for tab-based sourcing/tariff
  activeVendorTab: number = 0;
  sourcingVendors: any[] = [];
  selectedSourcingVendors: any[] = [];
  tariffVendors: any[] = [];
  selectedTariffVendors: any[] = [];
  showVendorTabsDialog: boolean = false;
  currentVendorCriteria: any = {};
  sourcingSelection: any = {};
  vendorTypeOptions: any[] = [];
  filteredTariffVendors: any[] = [];
  tariffFilter: any = {};
  expandedSourcingRows: any[] = [];
  expandedTariffRows: any[] = [];
  selectedTariffSelection: any[] = [];
  sourcingExpandedKeys: { [key: string]: boolean } = {};
  tariffExpandedKeys: { [key: string]: boolean } = {};
  chargesDialogVisible: boolean = false;
  chargesDialogVendor: any = null;

  get hasSelectedSourcingVendors(): boolean {
    return (
      Array.isArray(this.sourcingVendors) &&
      this.sourcingVendors.some((v: any) => !!v.selected)
    );
  }
  get hasSelectedFilteredTariffVendors(): boolean {
    return Array.isArray(this.selectedTariffSelection) && this.selectedTariffSelection.length > 0;
  }

  onSourcingRowExpand(event: any) {
    const key = String(event.data?.id ?? '');
    if (key) this.sourcingExpandedKeys[key] = true;
    // ensure subcharges exist
    if (!event.data.sub_charges || event.data.sub_charges.length === 0) {
      this.sourceService.getSubCharges(Number(event.data.id)).subscribe({
        next: (list) => {
          event.data.sub_charges = Array.isArray(list) ? list : [];
          this.cdr.detectChanges();
        },
      });
    }
  }

  onSourcingRowCollapse(event: any) {
    const key = String(event.data?.id ?? '');
    if (key) delete this.sourcingExpandedKeys[key];
  }

  toggleSourcingRow(vendor: any) {
    const key = String(vendor?.id ?? '');
    if (!key) return;
    const expanded = !!this.sourcingExpandedKeys[key];
    if (expanded) {
      delete this.sourcingExpandedKeys[key];
    } else {
      this.sourcingExpandedKeys[key] = true;
      if (!vendor.sub_charges || vendor.sub_charges.length === 0) {
        this.sourceService.getSubCharges(Number(vendor.id)).subscribe({
          next: (list) => {
            vendor.sub_charges = Array.isArray(list) ? list : [];
            this.cdr.detectChanges();
          },
        });
      }
    }
    this.cdr.detectChanges();
  }

  onTariffRowExpand(event: any) {
    const key = String(event.data?.id ?? '');
    if (key) this.tariffExpandedKeys[key] = true;
  }

  onTariffRowCollapse(event: any) {
    const key = String(event.data?.id ?? '');
    if (key) delete this.tariffExpandedKeys[key];
  }
  // Tab definitions
  vendorTabs = [
    { label: 'Get Sourcing', index: 0 },
    { label: 'Select Sourcing', index: 1 },
    { label: 'Get Tariff', index: 2 },
    { label: 'Select Tariff', index: 3 },
  ];

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
    private vendorService: VendorService,
    private masterTypeService: MasterTypeService,
    private currencyCodeService: CurrencyCodeService,
    private carriageService: CarriageService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private sourceSalesService: SourceSalesService,
    private sourceService: SourceService,
    private masterItemService: MasterItemService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadServiceAreaOptions().subscribe();
    // console.log("Debug: obtaining username from the auth service during enquiry on Init", this.authService.getUserName())
    this.loadInitialData();
    this.loadMappedEnquirySeriesCode();
    this.loadMasterTypeOptions();
    this.loadCarriageDirectionOptions();
    this.updateFinalizedVendorsPreview(); // Initialize finalized vendors preview
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
      cargo_type: [''],
      from_location: ['', Validators.required],
      to_location: ['', Validators.required],
      effective_date_from: ['', Validators.required],
      effective_date_to: ['', Validators.required],
      department: ['', Validators.required],
      service_type: [''],
      status: ['Open', Validators.required],
      remarks: [''],
    });
  }

  loadInitialData() {
    // Load any initial data needed from masters.
    forkJoin({
      enquiries: this.loadEnquiries(),
      locations: this.loadLocations(),
      vendors: this.loadVendors(),
      departments: this.loadDepartments(),
      basis: this.loadBasisOptions(),
      customers: this.loadCustomers(),
      serviceTypes: this.loadServiceTypes(),
      locationTypes: this.loadLocationTypes(),
      serviceAreas: this.loadServiceAreaOptions(),
      sourceSales: this.loadSourceSalesOptions(),
      cargoType: this.loadCargoTypeOptions(),
      currencyCode: this.loadCurrencyOptions(),
    }).subscribe({
      next: () => {
        console.log('All initial data loaded successfully');
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load initial data',
        });
      },
    });
  }

  // Load locations from the location masters
  loadLocations() {
    return this.masterLocationService.getAll().pipe(
      tap((locations: any[]) => {
        this.allLocations = locations.filter((l) => l.active);
        console.log('Loaded all locations:', this.allLocations.length);

        // Initialize location options formatted as CODE - NAME
        this.fromLocationOptions = this.allLocations.map((l) => ({
          label: `${l.code} - ${l.name}`,
          value: l.code,
        }));
        this.toLocationOptions = this.allLocations.map((l) => ({
          label: `${l.code} - ${l.name}`,
          value: l.code,
        }));

        console.log('From location options:', this.fromLocationOptions.length);
        console.log('To location options:', this.toLocationOptions.length);
      })
    );
  }

  // Load vendors for mapping code -> display name
  loadVendors() {
    return this.vendorService.getAll().pipe(
      tap((vendors: any[]) => {
        this.allVendors = vendors || [];
        console.log('Loaded all vendors:', this.allVendors.length);
      })
    );
  }

  getVendorName(codeOrNo: string): string {
    if (!codeOrNo || !this.allVendors || this.allVendors.length === 0)
      return codeOrNo || '';
    const v = this.allVendors.find(
      (x: any) =>
        x.vendor_no === codeOrNo || x.name === codeOrNo || x.name2 === codeOrNo
    );
    return v ? v.name2 || v.name || codeOrNo : codeOrNo;
  }

  getLocationName(locationCode: string): string {
    if (!locationCode || !this.allLocations) return locationCode || '';
    const location = this.allLocations.find((l) => l.code === locationCode);
    return location ? `${location.name}` : locationCode;
  }

  loadEnquiries() {
    return this.enquiryService.getAllEnquiries().pipe(
      tap((enquiries: Enquiry[]) => {
        console.log('Debug: Enquiry response from initial data', enquiries);
        this.enquiries = (enquiries as any)['data'];
        console.log(
          'this.enquiry property value after assignment',
          this.enquiries
        );
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
        this.departmentNameToCode.clear();
        (departments || [])
          .filter(
            (d) =>
              !d.status ||
              d.status === 'Active' ||
              d.status === 'active' ||
              d.status === '' ||
              d.status === null
          )
          .forEach((d) => {
            if (d.name && d.name.trim()) {
              const lowerName = d.name.trim().toLowerCase();
              if (!uniqueNames.has(lowerName)) {
                uniqueNames.set(lowerName, d.name.trim());
              }
              this.departmentNameToCode.set(d.name.trim(), d.code);
            }
          });

        this.departmentOptions = Array.from(uniqueNames.values())
          .map((name) => ({ label: name, value: name }))
          .sort((a, b) => a.label.localeCompare(b.label));

        console.log('Department options:', this.departmentOptions);
        this.filterServiceType();
      })
    );
  }

  // show enquiry preview function
  showEnquiryPreview() {
    if (this.selectedEnquiry?.code === 'MAA_FF_ENQ') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail:
          'Save the enquiry and source the vendor details before proceeding to preview.',
      });
      return;
    }
    // calling the preview api method
    this.enquiryService
      .getEnquiryPreviewByCode(this.selectedEnquiry?.code || '')
      .subscribe({
        next: (response: any) => {
          console.log('enquiry previewresponse,', response);
          this.selectedEnquiryPreview = response;
          console.log(
            'preview enquiry api response value updated to pre,',
            this.selectedEnquiryPreview
          );
        },
      });
    this.showPreviewDialog = true;
  }

  // Load basis options from the basis service
  loadBasisOptions() {
    return this.basisService.getAll().pipe(
      tap((basis: any[]) => {
        this.basisOptions = (basis || [])
          .filter((b) => b.status === 'Active')
          .map((b) => ({
            label: `${b.code} - ${b.description}`,
            value: b.code,
          }));

        console.log('Basis options:', this.basisOptions);
      })
    );
  }
  loadCargoTypeOptions() {
    // return this.masterItemService.getAll().pipe(
    //   tap((cargoTypes: any[]) => {
    //     this.cargoTypeOptions = (cargoTypes || [])
    //       .filter(
    //         (cargoType) =>
    //           cargoType.active === true && cargoType.item_type === 'CARGO_TYPE'
    //       )
    //       .map((CT) => ({ label: `${CT.code}-${CT.name}`, value: CT.name }));
    //     console.log('Cargo Type options,', this.cargoTypeOptions);
    //   }),
    return this.masterTypeService.getAll().pipe(
      tap((cargoMasterTypes: any[]) => {
        this.cargoTypeOptions = (cargoMasterTypes || [])
          .filter(
            (cargoMaster) =>
              cargoMaster.status.toLowerCase() === 'active' &&
              cargoMaster.key.toLowerCase() === 'cargo_type'
          )
          .map((cargoMaster) => ({
            label: `${cargoMaster.value}-${cargoMaster.description}`,
            value: cargoMaster.value,
          }));
        console.log('cargoType Options,', this.cargoTypeOptions);
      }),
      catchError((error) => {
        console.error('Error loading cargo type options', error);
        return of([]);
      })
    );
  }

  loadCurrencyOptions() {
    return this.currencyCodeService.getCurrencies().pipe(
      tap((currencyCodes: any[]) => {
        console.log('currencyCode service response,', currencyCodes);
        this.sellPriceCurrencyOptions = (currencyCodes || [])
          .filter(
            (currencyCode) => currencyCode.status.toLowerCase() === 'active'
          )
          .map((currencyCode) => ({
            label: currencyCode.code,
            value: currencyCode.code,
          }));
        console.log('Currency code options,', this.sellPriceCurrencyOptions);
      }),
      catchError((error) => {
        console.log('load currency service master error,', error);
        return of([]);
      })
    );
  }

  loadServiceAreaOptions() {
    return this.serviceAreaService.getServiceAreas().pipe(
      tap((serviceAreas: any[]) => {
        this.serviceAreaOptionsRaw = (serviceAreas || []).filter((sa) => sa.status === 'active');
        this.serviceAreaDropdownOptions = this.serviceAreaOptionsRaw.map((sa) => ({ label: sa.service_area, value: sa.service_area, type: sa.type }));
        console.log('Service area options:', this.serviceAreaDropdownOptions);
      }),
      catchError((error) => {
        console.error('Error loading service areas:', error);
        return of([]);
      })
    );
  }

  getServiceAreasForType(type: string) {
    const t = (type || '').toString().trim().toLowerCase();
    const filtered = (this.serviceAreaOptionsRaw || []).filter((sa) => (sa.type || '').toString().trim().toLowerCase() === t);
    return filtered.map((sa) => ({ label: sa.service_area, value: sa.service_area }));
  }

  onLineItemTypeChange(item: any) {
    const opts = this.getServiceAreasForType(item.type);
    const values = new Set(opts.map((o) => o.value));
    if (!values.has(item.service_area)) {
      item.service_area = undefined;
    }
  }

  loadCarriageDirectionOptions() {
    this.carriageService.getCarriageDirection().subscribe({
      next: (rows: any[]) => {
        this.carriageOptionsFrom = (rows || [])
          .filter((r) => r.is_from)
          .map((r) => ({
            label: r.carriage,
            value: r.carriage,
          }));
        this.carriageOptionsTo = (rows || [])
          .filter((r) => r.is_to)
          .map((r) => ({
            label: r.carriage,
            value: r.carriage,
          }));
        const union: Record<string, { label: string; value: string }> = {};
        [...this.carriageOptionsFrom, ...this.carriageOptionsTo].forEach((opt) => {
          union[opt.value] = union[opt.value] || opt;
        });
        this.carriageOptionsAll = Object.values(union);
      },
    });
  }

  loadSourceSalesOptions() {
    return this.sourceSalesService.getSourceSales().pipe(
      tap((sourceSales: any[]) => {
        this.sourceSalesOptions = (sourceSales || [])
          .filter((s) => s.status === 'active' || s.status === 'Active')
          .map((s) => ({ label: `${s.code} - ${s.name}`, value: s.code }));
        console.log('Source sales options loaded:', this.sourceSalesOptions);
      }),
      catchError((error) => {
        console.error('Error loading source sales:', error);
        return of([]);
      })
    );
  }

  onSelectionLineItemChange(event: any) {
    console.log('Line Item Selection changed event,', event);
    console.log(
      'Selected Line Item for enquiry,',
      this.selectedEnquiry!.id,
      'list',
      this.selectedLineItems
    );
    // event.
  }

  // Property to store source sales person name
  sourceSalesPersonName: string = '';

  onSourceSalesChange() {
    if (this.selectedEnquiry && this.selectedEnquiry?.source_sales_code) {
      const selected = this.sourceSalesOptions.find(
        (option) => option.value === this.selectedEnquiry?.source_sales_code
      );
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
        this.filterServiceType();
        console.log('Service types loaded:', this.allServiceTypes);
        this.refreshServiceTypeFilterOptions();
      })
    );
  }

  // Load location types
  loadLocationTypes() {
    const context = this.contextService.getContext();
    return this.masterTypeService.getAll().pipe(
      tap((locationTypes: any[]) => {
        console.log(
          'DEBUG: Loading the initial value from the location types,',
          locationTypes
        );
        // Fix: Use 'key' instead of 'type' and add status filter
        this.allLocationTypes =
          locationTypes?.filter(
            (lt) => lt.key === 'LOCATION' && lt.status === 'Active'
          ) || [];
        console.log('DEBUG: Filtered location types:', this.allLocationTypes);

        this.locationTypeFromOptions = this.allLocationTypes.map((lt) => ({
          label: lt.value, // Use 'value' field for display
          value: lt.value, // Use 'value' field for the actual value
        }));
        this.locationTypeToOptions = [...this.locationTypeFromOptions];
        console.log(
          'Location type options loaded:',
          this.locationTypeFromOptions.length,
          this.locationTypeFromOptions
        );
      })
    );
  }

  getLocationsForType(type: string) {
    if (!type || !this.allLocations || this.allLocations.length === 0)
      return [];
    const exact = this.allLocations.filter((l: any) => l.type === type);
    const list =
      exact.length > 0
        ? exact
        : this.allLocations.filter(
            (l: any) =>
              (l.type || '').toLowerCase() === (type || '').toLowerCase()
          );
    return list.map((l: any) => ({
      label: `${l.code} - ${l.name}`,
      value: l.code,
    }));
  }

  onCarriageChanged(row: any, selectedCarriage: string) {
    const inFrom = this.carriageOptionsFrom.some((o) => o.value === selectedCarriage);
    const inTo = this.carriageOptionsTo.some((o) => o.value === selectedCarriage);
    if (inFrom && !inTo) row.direction = 'FROM';
    else if (!inFrom && inTo) row.direction = 'TO';
    else if (inFrom && inTo) row.direction = row.direction || 'TO';
    else row.direction = null;
  }

  addCarriageRow() {
    this.carriageMappings = [
      ...this.carriageMappings,
      { direction: null, carriage: null, location_type: null, location: null },
    ];
  }

  removeCarriageRow(i: number) {
    this.confirmationService.confirm({
      message: 'Delete this carriage row?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.carriageMappings = this.carriageMappings.filter((_, idx) => idx !== i);
        const enqId = this.selectedEnquiry?.id;
        if (enqId) {
          this.carriageService
            .saveEnquiryCarriageMapping(enqId, this.carriageMappings)
            .subscribe({
              next: () => {
                this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Carriage row deleted' });
                this.confirmationService.close();
              },
              error: () => {
                this.confirmationService.close();
              }
            });
        }
        else {
          this.confirmationService.close();
        }
      },
      reject: () => {
        this.confirmationService.close();
      },
    });
  }

  // Master type options property
  masterTypeOptions: { label: string; value: string }[] = [];

  // sell price currency options
  sellPriceCurrencyOptions: { label: string; value: string }[] = [];

  // Load master type options
  loadMasterTypeOptions() {
    this.masterTypeService.getAll().subscribe((types: any[]) => {
      // Filter by SERVICE_AREA key
      this.masterTypeOptions = (types || [])
        .filter((t) => t.key === 'SERVICE_AREA')
        .map((t) => ({ label: t.value, value: t.value }));
    });
  }

  // Filter service types based on department
  filterServiceType() {
    console.log(
      'Debug: current selected enquiry value in filter service type',
      this.selectedEnquiry
    );
    if (!this.selectedEnquiry?.department || !this.allServiceTypes.length) {
      this.serviceTypeOptions = [];
      return;
    }

    console.log(
      'DEBUG: enquiry service type options in filter service type,',
      this.allServiceTypes
    );
    const departmentName = this.selectedEnquiry.department;
    const departmentCode = this.departmentNameToCode.get(departmentName);

    // First try exact match
    let filteredTypes = this.allServiceTypes.filter(
      (st) => st.department_name === departmentName
    );

    // If no exact match, try case-insensitive match
    if (filteredTypes.length === 0) {
      filteredTypes = this.allServiceTypes.filter(
        (st) =>
          st.department_name?.toLowerCase() === departmentName.toLowerCase()
      );
    }

    // If still no match, try matching by department code
    if (filteredTypes.length === 0 && departmentCode) {
      filteredTypes = this.allServiceTypes.filter(
        (st) => st.department_code === departmentCode
      );
    }

    if (filteredTypes.length === 0) {
      this.serviceTypeOptions = [];
    } else {
      this.serviceTypeOptions = filteredTypes.map((st) => ({
        label: `${st.code} - ${st.name}`,
        value: st.code,
      }));
    }

    // Clear selected service type if it's not in the filtered options
    const enquiry = this.selectedEnquiry;
    if (
      enquiry &&
      enquiry.service_type &&
      !this.serviceTypeOptions.find((opt) => opt.value === enquiry.service_type)
    ) {
      enquiry.service_type = '';
    }
  }
  
  refreshServiceTypeFilterOptions() {
    let list = this.allServiceTypes;
    const deptName = this.tariffFilter?.department;
    if (deptName) {
      const deptCode = this.departmentNameToCode.get(deptName);
      let filtered = list.filter((st: any) => st.department_name === deptName);
      if (filtered.length === 0) {
        filtered = list.filter(
          (st: any) => st.department_name?.toLowerCase() === deptName.toLowerCase()
        );
      }
      if (filtered.length === 0 && deptCode) {
        filtered = list.filter((st: any) => st.department_code === deptCode);
      }
      list = filtered.length ? filtered : list;
    }
    this.serviceTypeFilterOptions = (list || []).map((st: any) => ({
      label: `${st.code} - ${st.name}`,
      value: st.code,
    }));
  }
  
  onTariffDepartmentFilterChange() {
    this.refreshServiceTypeFilterOptions();
    const exists = this.serviceTypeFilterOptions.some(
      (opt: any) => opt.value === this.tariffFilter?.service_type
    );
    if (!exists) this.tariffFilter.service_type = undefined;
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
        if (!value) {
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
    return this.enquiries.some(
      (enquiry) =>
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
    } else if (type === 'cargoType') {
      this.showCargoTypeDialog = true;
    } else if (type === 'currencyCode') {
      this.showCurrencyCodeDialog = true;
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Open Master',
        detail: `Open ${type} master page`,
      });
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
          },
        });
        break;
      case 'basis':
        this.showBasisDialog = false;
        this.loadBasisOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges(),
        });
        break;
      case 'serviceArea':
        this.showServiceAreaDialog = false;
        this.loadServiceAreaOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges(),
        });
        break;
      case 'sourceSales':
        this.showSourceSalesDialog = false;
        this.loadSourceSalesOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges(),
        });
        break;
      case 'currencyCode':
        this.showCurrencyCodeDialog = false;
        this.loadCurrencyOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges(),
        });
        break;
      case 'cargoType':
        this.showCargoTypeDialog = false;
        this.loadCargoTypeOptions().subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges(),
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
            },
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
      code: this.isManualSeries ? '' : this.mappedEnquirySeriesCode || '',
      date: today.toISOString().split('T')[0], // Default today's date as specified
      customer_name: '',
      company_name: '',
      email: '',
      mobile: '',
      landline: '',
      name: '',
      department: '',
      basis: '',
      cargo_type: '',
      from_location: '',
      to_location: '',
      location_type_from: '',
      location_type_to: '',
      service_type: '',
      effective_date_from: today.toISOString().split('T')[0],
      effective_date_to: today.toISOString().split('T')[0],
      status: 'Open',
      enquiry_type: '',
      remarks: '',
      line_items: [],
      isNew: true,
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

    this.loadCarriageDirectionOptions();
  }

  editEnquiry(enquiry: Enquiry) {
    console.log('Debug: Editing the Enquiry', enquiry);
    this.loadEnquiry(enquiry.code!);
    // this.selectedEnquiry = { ...enquiry };
    // this.lineItems = enquiry.line_items || [];
    // this.vendorCards = enquiry.vendor_cards || [];

    // Set selected customer if company_name matches
    if (enquiry.company_name) {
      const matchingCustomer = this.customerOptions.find(
        (c) =>
          c.name === enquiry.company_name ||
          c.display_name === enquiry.company_name
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
  loadEnquiry(enquiryCode: string) {
    this.enquiryService.getEnquiryByCode(enquiryCode).subscribe({
      next: (enquiry: Enquiry) => {
        console.log(
          'Debug Loaded Enquiry value for the enquiry code:',
          enquiryCode,
          'enquiry response',
          enquiry
        );
        this.selectedEnquiry = { ...enquiry };
        this.currentEnquiry = { ...enquiry };

        // Set Date objects for calendar components
        this.selectedDate = this.selectedEnquiry.date
          ? new Date(this.selectedEnquiry.date)
          : null;
        this.selectedEffectiveDateFrom = this.selectedEnquiry
          .effective_date_from
          ? new Date(this.selectedEnquiry.effective_date_from)
          : null;
        this.selectedEffectiveDateTo = this.selectedEnquiry.effective_date_to
          ? new Date(this.selectedEnquiry.effective_date_to)
          : null;

        this.lineItems = enquiry.line_items || [];
        console.log(
          'line items list loaded for the enquiry code,',
          enquiryCode,
          'is,',
          this.lineItems
        );

        this.selectedLineItems = this.lineItems.filter(
          (lineItem) => lineItem?.is_selected
        );

        console.log(
          'Selected LineItems loaded during the load enquiry,',
          this.selectedLineItems
        );
        //
        this.vendorCards = enquiry.vendor_cards || [];

        // Process vendor cards to ensure charges are in proper format
        this.vendorCards = this.vendorCards.map((card) =>
          this.processVendorCardCharges(card)
        );

        console.log(
          'DEBUG loadEnquiry - vendor_cards from database:',
          enquiry.vendor_cards
        );
        console.log(
          'DEBUG loadEnquiry - processed vendorCards:',
          this.vendorCards
        );
        if (this.vendorCards.length > 0) {
          console.log(
            'DEBUG loadEnquiry - first vendor card charges:',
            this.vendorCards[0].charges
          );
          console.log(
            'DEBUG loadEnquiry - first vendor card structure:',
            this.vendorCards[0]
          );
        }

        this.filterServiceType();

        // Apply location filtering based on selected location types
        this.filterFromLocations();
        this.filterToLocations();

        if (this.selectedEnquiry?.id) {
          this.carriageService
            .getEnquiryCarriageMapping(this.selectedEnquiry.id)
            .subscribe({
              next: (rows) => {
                this.carriageMappings = Array.isArray(rows) ? rows : [];
              },
            });
        }

        // Ensure context-filtered dropdowns contain the saved values when editing
        forkJoin({
          sourceSales: this.loadSourceSalesOptions(),
          serviceAreas: this.loadServiceAreaOptions(),
        }).subscribe({
          next: () => this.cdr.detectChanges(),
          error: () => this.cdr.detectChanges(),
        });

        this.isDialogVisible = true;
      },
      error: (error: any) => {
        console.error('Error fetching enquiry:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch enquiry details',
        });
      },
    });
  }

  viewEnquiry(enquiryCode: string) {
    this.loadEnquiry(enquiryCode);
  }

  // // generate menu model for a line item row index
  // getLineItemMenu(index: number): MenuItem[] {
  //   return [
  //     {
  //       label: 'Sourcing Operations',
  //       items: [
  //         {
  //           label: 'Get Sourcing dlg',
  //           icon: 'pi pi-search',
  //           command: () => this.getSourcing(),
  //         },
  //         {
  //           label: 'Get Tariff dlg',
  //           icon: 'pi pi-calculator',
  //           command: () => this.getTariff(),
  //         },
  //         {
  //           label: 'Get Sourcing tbl',
  //           icon: 'pi pi-search',
  //           command: () =>
  //             this.openVendorTreeForLineWithType(index, 'sourcing'),
  //         },
  //         {
  //           label: 'Get Tariff tbl',
  //           icon: 'pi pi-calculator',
  //           command: () => this.openVendorTreeForLineWithType(index, 'tariff'),
  //         },
  //       ],
  //     },
  //     {
  //       label: 'Item Actions',
  //       items: [
  //         {
  //           label: 'Edit',
  //           icon: 'pi pi-pencil',
  //           command: () => this.editLineItem(index),
  //         },
  //         {
  //           label: 'Delete',
  //           icon: 'pi pi-trash',
  //           command: () => this.deleteLineItem(index),
  //         },
  //       ],
  //     },
  //   ];
  // }

  /**
   * Fetch and show tree table inline under the given line index.
   * type: 'sourcing' | 'tariff' | 'both'
   */
  openVendorTreeForLineWithType(
    lineIndex: number,
    type: 'sourcing' | 'tariff' | 'both' = 'both'
  ) {
    if (!this.selectedEnquiry) return;
    const enq = this.selectedEnquiry!;
    const criteria = {
      department: enq.department,
      from_location: enq.from_location,
      to_location: enq.to_location,
      effective_date_from: this.formatDateForAPI(enq.effective_date_from),
      effective_date_to: this.formatDateForAPI(enq.effective_date_to),
      basis: this.lineItems[lineIndex]?.basis || this.lineItems[0]?.basis,
      service_type: enq.service_type,
      from_location_type: enq.location_type_from,
      to_location_type: enq.location_type_to,
    };

    const sourcing$ =
      type === 'tariff'
        ? null
        : this.enquiryService.getSourcingOptions(
            this.currentEnquiry?.code || '',
            criteria
          );
    const tariff$ =
      type === 'sourcing'
        ? null
        : this.enquiryService.getTariffOptions(
            this.currentEnquiry?.code || '',
            criteria
          );

    const calls = [];
    if (sourcing$) calls.push(sourcing$);
    if (tariff$) calls.push(tariff$);

    if (calls.length === 0) return;

    forkJoin(calls).subscribe({
      next: (results: any[]) => {
        const sourcingResult = sourcing$ ? results.shift() : [];
        const tariffResult = tariff$ ? results.shift() : [];
        this.buildVendorTreeForLine(
          lineIndex,
          sourcingResult || [],
          tariffResult || [],
          type
        );
        // open/close toggle: if already open for same index -> close
        this.openTreeIndex = this.openTreeIndex === lineIndex ? -1 : lineIndex;
      },
      error: (err) => {
        console.error('Error loading vendors for line', lineIndex, err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load vendor lists',
        });
      },
    });
  }

  // Handle selection change in sourcing or tariff lists
  onSelectionChange(source: any) {
    // Initialize selectedItems array if it doesn't exist
    if (!source.selectedItems) {
      source.selectedItems = [];
    }
    console.log(
      'source selection change,',
      source.selectedItems,
      'source Event',
      source
    );

    // Update the summary with selected items data
    if (source.selectedItems && source.selectedItems.length > 0) {
      // Get count of selected vendors
      const selectedCount = source.selectedItems.length;

      // If only one vendor is selected, show its details
      if (selectedCount === 1) {
        const selected = source.selectedItems[0];

        // Update the summary with the selected item's data
        source.sourced_no =
          selected.sourced_no || 'SRC-' + source.sourced_list.indexOf(selected);
        source.vendor_name = selected.vendor_name;
        source.currency_code = selected.currency;
        source.charge = selected.charges;
        source.sourced_time = selected.created_at;
        source.remarks = selected.negotiated_remarks;
      } else {
        // If multiple vendors are selected, show count in the summary
        source.sourced_no = `${selectedCount} selected`;
        source.vendor_name = 'Multiple vendors';
        source.currency_code = 'Multiple';
        source.charge = this.calculateTotalCharge(source.selectedItems);
        source.sourced_time = new Date().toISOString();
        source.remarks = `${selectedCount} vendors selected`;
      }

      // Force change detection to update the UI
      this.cdr.detectChanges();
    } else {
      // If no vendors are selected, clear the summary
      source.sourced_no = '--';
      source.vendor_name = '--';
      source.currency_code = '--';
      source.charge = '--';
      source.sourced_time = '--';
      source.remarks = '--';

      // Force change detection to update the UI
      this.cdr.detectChanges();
    }
  }

  // Calculate total charge from selected items
  private calculateTotalCharge(selectedItems: any[]): number {
    return selectedItems.reduce((total, item) => {
      return total + (parseFloat(item.charges) || 0);
    }, 0);
  }

  // Finalize the vendor selection
  finalizeVendorSelection(source: any) {
    if (
      !source.selected_source_items ||
      source.selected_source_items.length === 0
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one vendor to finalize',
      });
      return;
    }
    console.log('finalize vendor selection argument value,', source);
    {
      /* // Mark the selected vendors as finalized
    source.finalizedItems = [...source.selectedItems];

    // Update the summary with finalized status
    if (source.finalizedItems.length === 1) {
      const finalized = source.finalizedItems[0];
      source.sourced_no =
        finalized.sourced_no || 'SRC-' + source.sourced_list.indexOf(finalized);
      source.vendor_name = finalized.vendor_name;
      source.currency_code = finalized.currency;
      source.charge = finalized.charges;
      source.sourced_time = finalized.created_at;
      source.remarks = finalized.negotiated_remarks;
      source.status = 'Finalized';
    } else {
      source.sourced_no = `${source.finalizedItems.length} finalized`;
      source.vendor_name = 'Multiple vendors';
      source.currency_code = 'Multiple';
      source.charge = this.calculateTotalCharge(source.finalizedItems);
      source.sourced_time = new Date().toISOString();
      source.remarks = `${source.finalizedItems.length} vendors finalized`;
      source.status = 'Finalized';
    } */
    }

    const selectedVendorCardList = source.selected_source_items;

    // api Call
    this.enquiryService
      .updateVendorCardSelection(
        this.selectedEnquiry?.code || '',
        selectedVendorCardList[0].enquiry_line_item_id,
        selectedVendorCardList[0].source_type,
        selectedVendorCardList
      )
      .subscribe({
        next: (response: any) => {
          console.log('response of finalized vendor card,', response);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `${source.finalizedItems.length} vendor(s) finalized successfully`,
          });
        },
        error: (error: any) => {},
      });

    // Update the finalized vendors preview
    this.updateFinalizedVendorsPreview();

    // Force change detection to update the UI
    this.cdr.detectChanges();
  }

  // Get all finalized vendors across all line items
  getAllFinalizedVendors(): any[] {
    const finalizedVendors: any[] = [];

    if (this.lineItems) {
      this.lineItems.forEach((item, lineIndex) => {
        // Check sourcing
        // if (item.sourcing) {
        //   item.sourcing.forEach(source => {
        //     if (source.finalizedItems && source.finalizedItems.length > 0) {
        //       source.finalizedItems.forEach((vendor: any) => {
        //         finalizedVendors.push({
        //           lineItemNo: lineIndex + 1,
        //           type: 'Sourcing',
        //           vendorName: vendor.vendor_name,
        //           sourceNo: vendor.sourced_no || ('SRC-' + source.sourced_list.indexOf(vendor)),
        //           charge: vendor.charges,
        //           currency: vendor.currency,
        //           remarks: vendor.negotiated_remarks
        //         });
        //       });
        //     }
        //   });
        // }
        // Check tariff
        // if (item.tariff) {
        //   item.tariff.forEach(source => {
        //     if (source.finalizedItems && source.finalizedItems.length > 0) {
        //       source.finalizedItems.forEach((vendor: any) => {
        //         finalizedVendors.push({
        //           lineItemNo: lineIndex + 1,
        //           type: 'Tariff',
        //           vendorName: vendor.vendor_name,
        //           sourceNo: vendor.sourced_no || ('SRC-' + source.sourced_list.indexOf(vendor)),
        //           charge: vendor.charges,
        //           currency: vendor.currency,
        //           remarks: vendor.negotiated_remarks
        //         });
        //       });
        //     }
        //   });
        // }
      });
    }

    return finalizedVendors;
  }
  formatDateTime(date: string | Date | undefined | null): string {
    if (!date) return '';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      // Check if date is valid
      if (isNaN(dateObj.getTime())) return '';

      // Format date as dd/mm/yyyy
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();

      // Format time as hh:mm
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return '';
    }
  }
  // Update the finalized vendors preview
  updateFinalizedVendorsPreview() {
    this.finalizedVendors = this.getAllFinalizedVendors();
  }

  // Initialize selectedItems for all sources
  // private initializeSelectedItems() {
  //   if (this.lineItems) {
  //     this.lineItems.forEach(item => {
  //       if (item.sourcing) {
  //         item.sourcing.forEach(source => {
  //           if (!source.selectedItems) {
  //             source.selectedItems = [];
  //           }
  //         });
  //       }
  //       if (item.tariff) {
  //         item.tariff.forEach(source => {
  //           if (!source.selectedItems) {
  //             source.selectedItems = [];
  //           }
  //         });
  //       }
  //     });
  //   }
  // }

  private buildVendorTreeForLine(
    lineIndex: number,
    sourcing: any[],
    tariff: any[],
    mode: 'sourcing' | 'tariff' | 'both'
  ) {
    const nodes: TreeNode[] = [];
    this.vendorNodeMapByLine[lineIndex] = {};
    this.selectedTreeKeysByLine[lineIndex] = {};

    if (mode !== 'tariff') {
      const sourcingChildren = (sourcing || []).map((v: any, i: number) => {
        const key = `sourcing-${i}`;
        this.vendorNodeMapByLine[lineIndex][key] = v;
        return {
          key,
          data: {
            label: v.vendor_name,
            vendor_type: v.vendor_type,
            mode: v.mode,
            from_location: v.from_location,
            to_location: v.to_location,
            basis: v.basis,
            charges: v.charges,
          },
        };
      });
      nodes.push({
        key: 'sourcing-root',
        data: { label: 'Sourcing' },
        children: sourcingChildren,
      });
    }

    if (mode !== 'sourcing') {
      const tariffChildren = (tariff || []).map((v: any, i: number) => {
        const key = `tariff-${i}`;
        this.vendorNodeMapByLine[lineIndex][key] = v;
        return {
          key,
          data: {
            label: v.vendor_name,
            vendor_type: v.vendor_type,
            mode: v.mode,
            from_location: v.from_location,
            to_location: v.to_location,
            basis: v.basis,
            charges: v.charges,
          },
        };
      });
      nodes.push({
        key: 'tariff-root',
        data: { label: 'Tariff' },
        children: tariffChildren,
      });
    }

    this.vendorTreeNodesByLine[lineIndex] = nodes;
  }

  onVendorNodeSelectForLine(event: any, lineIndex: number) {
    const nodeKey: string = event.node?.key;
    if (!nodeKey) return;
    const prefix = nodeKey.split('-')[0];
    // keep only one child selected per group
    Object.keys(this.selectedTreeKeysByLine[lineIndex] || {}).forEach((k) => {
      if (k.startsWith(prefix) && k !== nodeKey) {
        delete this.selectedTreeKeysByLine[lineIndex][k];
      }
    });
    // ensure selected flag set
    this.selectedTreeKeysByLine[lineIndex][nodeKey] = true;
  }

  onVendorNodeUnselectForLine(event: any, lineIndex: number) {
    const nodeKey: string = event.node?.key;
    if (!nodeKey) return;
    delete this.selectedTreeKeysByLine[lineIndex][nodeKey];
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
      case 'Open':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Confirmed':
        return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
    }
  }
  formatDate(date: string | Date | undefined | null): string {
    if (!date) return '--';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      // Check if date is valid
      if (isNaN(dateObj.getTime())) return '--';

      // Format the date as needed
      return dateObj.toLocaleDateString('en-GB'); // Using en-GB for dd/mm/yyyy format
    } catch {
      return '--';
    }
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
  getFullSourceList(summary: any): any[] {
    // Return the full sourced_list if available, otherwise return summary as single item array
    if (summary.sourced_list && summary.sourced_list.length > 0) {
      return summary.sourced_list;
    }

    // If no sourced_list, create an array with the summary data for display
    return [
      {
        sourced_no: summary.sourced_no,
        vendor_name: summary.vendor_name,
        currency: summary.currency_code,
        charge: summary.charge,
        sourced_time: summary.sourced_time,
        remarks: summary.remarks,
        // Include additional fields that might be in sourced_list items
        currency_code: summary.currency_code,
        charges: summary.charge,
        created_at: summary.sourced_time,
        negotiated_remarks: summary.remarks,
      },
    ];
  }

  onCustomerSelect(event: any) {
    console.log('Customer selected event:', event);
    const customerId = event?.value;
    const customer = this.customerOptions.find((c) => c.id === customerId);
    console.log('Customer selected:', customer);
    if (customer && customer.id && this.selectedEnquiry) {
      // Existing customer - set company and load contacts to decide autofill/dropdown
      this.selectedEnquiry.company_name =
        customer.name || customer.display_name;
      this.isNewCustomer = false;
      console.log(
        'selectedEnquiry value during changing customer:',
        this.selectedEnquiry
      );
      if (this.selectedEnquiry.customer_name) {
        // erasing the previously selected customer contact
        this.selectedEnquiry.customer_name = '';
        this.selectedEnquiry.email = '';
        this.selectedEnquiry.mobile = '';
        this.selectedEnquiry.landline = '';
        console.log(
          'erased previously selected customer contact details as customer is changed:',
          this.selectedEnquiry
        );
      }
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
          const matchingContact = contacts.find(
            (c) =>
              c.name === this.selectedEnquiry?.customer_name ||
              c.email === this.selectedEnquiry?.email ||
              c.mobile === this.selectedEnquiry?.mobile ||
              c.landline === this.selectedEnquiry?.landline
          );
          console.log(
            'Matching contact found:',
            matchingContact,
            'amongcontacts:',
            contacts,
            'for enquiry data:',
            this.selectedEnquiry
          );
          if (contacts.length === 1) {
            // Single contact - check if enquiry data matches
            const only = contacts[0];
            this.showContactDropdown = false;
            this.selectedEnquiry.customer_name = only.name || '';
            this.selectedEnquiry.email = only.email || '';
            this.selectedEnquiry.mobile = only.mobile || '';
            this.selectedEnquiry.landline = only.landline || '';
            // commenting this out temproarily to always show the single contact in dropdown
            {
              /* if (matchingContact) {
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
            } */
            }
          } else if (contacts && contacts.length > 1) {
            // Multiple contacts
            this.showContactDropdown = true;

            {
              /*  if (matchingContact) {
              // Found matching contact
              this.selectedContact = matchingContact;
              this.onContactSelect({ value: matchingContact });
            } else { */
            }
            // No matching contact, try primary contact or set manual
            const primaryContact = contacts.find((c) => c.is_primary);
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
            // }
          }
        } else {
          // No contacts found
          this.showContactDropdown = false;
          this.selectedContact = null;
          this.onContactSelect({ value: null }); // Clear contact fields
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
          detail: 'Failed to load customer contacts',
        });
        this.showContactDropdown = false;
      },
    });
  }

  onContactSelect(event: any) {
    const contact = event.value;
    console.log('Contact selected:', contact);
    if (contact && this.selectedEnquiry) {
      this.selectedEnquiry.customer_name = contact.name || '';
      this.selectedEnquiry.email = contact.email || '';
      this.selectedEnquiry.mobile = contact.mobile || '';
      this.selectedEnquiry.landline = contact.landline || '';
    } else {
      this.selectedEnquiry!.customer_name = '';
      this.selectedEnquiry!.email = '';
      this.selectedEnquiry!.mobile = '';
      this.selectedEnquiry!.landline = '';
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
      const customer = this.customerOptions.find(
        (c) => c.id === this.selectedCustomer
      );
      if (customer) {
        this.selectedEnquiry.company_name =
          customer.name || customer.display_name;
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
    if (
      !this.isManualLandline &&
      this.selectedContact &&
      this.selectedEnquiry
    ) {
      // Reset to contact selection
      this.selectedEnquiry.landline = this.selectedContact.landline || '';
    }
  }
  /*
  ------------------------
   Line Items methods
  ------------------------
*/
  addLineItem() {
    const newItem: EnquiryLineItem = {
      s_no: this.lineItems.length + 1,
      quantity: 0,
      type: '',
      service_area: '',
      basis: '',
      remarks: '',
      status: 'Active',
      line_from_location_type: '',
      line_from_location: '',
      line_to_location_type: '',
      line_to_location: '',
      enquiry_id: this.selectedEnquiry!.id || '',
      enquiry_summary: [],
    };
    console.log('add Line Item is clicked and the new item value is,', newItem);
    this.lineItems.push(newItem);
    // calling the hierarchy mapping function to update the tree nodes
  }

  editLineItem(index: number) {
    // For now, items are editable inline
    // Could implement a separate edit dialog if needed
  }

  deleteLineItem(index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this line item?',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.lineItems.splice(index, 1);
        // Renumber items
        this.lineItems.forEach((item, i) => {
          item.s_no = i + 1;
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Line item deleted successfully',
        });
        this.confirmationService.close();
      },
      reject: () => {
        this.confirmationService.close();
      },
    });
  }

  /*
  -----------------------------
   Sourcing and Tariff methods
  -----------------------------
*/
  canGetSourcing(): boolean {
    const firstBasis = this.lineItems[0]?.basis;
    const enq = this.selectedEnquiry;
    return !!(
      enq &&
      (enq.company_name || enq.customer_name) &&
      enq.from_location &&
      enq.to_location &&
      enq.effective_date_from &&
      enq.effective_date_to &&
      firstBasis &&
      this.lineItems.length > 0
    );
  }

  canGetTariff(): boolean {
    const firstBasis = this.lineItems[0]?.basis;
    const enq = this.selectedEnquiry;
    return !!(
      enq &&
      (enq.company_name || enq.customer_name) &&
      enq.from_location &&
      enq.to_location &&
      enq.effective_date_from &&
      enq.effective_date_to &&
      firstBasis &&
      this.lineItems.length > 0
    );
  }
  // 11/15/2025
  getSourcing(lineItemId: number) {
    let savedLineItemsCount = 0;
    let currentLineItemsCount = this.lineItems.length;

    // Save enquiry first if needed
    this.enquiryService
      .getAllEnquiryLineItem(this.selectedEnquiry?.code || '')
      .subscribe({
        next: (data) => {
          savedLineItemsCount = Number(data.lineItemCount);
          if (
            !this.currentEnquiry?.code ||
            this.currentEnquiry?.code === 'MAA_FF_ENQ' ||
            savedLineItemsCount != currentLineItemsCount
          ) {
            this.saveEnquiry();
          }

          this.executeGetSourcing(lineItemId);
        },
        error: (error) => {
          console.error('Error fetching lineItem count:', error);
          this.executeGetSourcing(lineItemId);
        },
      });
  }

  private executeGetSourcing(lineItemId: number) {
    const lineItemIndex = Number(lineItemId) - 1;
    const enq = this.selectedEnquiry!;

    const li = this.lineItems[lineItemIndex];
    this.currentVendorCriteria = {
      line_item_type: li?.type,
      service_area: li?.service_area,
      basis: li?.basis,
      department: enq.department,
      cargo_type: enq.cargo_type,
      from_location: li?.line_from_location || enq.from_location,
      to_location: li?.line_to_location || enq.to_location,
      effective_date_from: this.formatDateForAPI(enq.effective_date_from),
      effective_date_to: this.formatDateForAPI(enq.effective_date_to),
      service_type: enq.service_type,
      from_location_type: li?.line_from_location_type || enq.location_type_from,
      to_location_type: li?.line_to_location_type || enq.location_type_to,
      lineItemId: lineItemId,
    };

    this.enquiryService
      .getSourcingOptions(
        this.currentEnquiry?.code!,
        this.currentVendorCriteria
      )
      .subscribe({
        next: (options) => {
          this.sourcingVendors = options.map((opt) => ({
            ...opt,
            enquiry_line_item_id: lineItemId,
            selected_subcharges: [],
            sell_rates: {},
            remarks: '',
            sub_charges: opt.sub_charges || this.normalizeCharges(opt.charges),
          }));
          const existingSelected = (() => {
            const li = this.selectedEnquiry?.line_items?.[lineItemIndex];
            const sourcingSummary = li?.enquiry_summary?.[0];
            const prev = sourcingSummary?.selected_source_items || [];
            return (prev || []).map((v: any) => ({
              ...v,
              card_id: v.card_id || v.master_id || v.id,
              enquiry_line_item_id: lineItemId,
              source_type: 'sourcing',
              selected_subcharges: v.selected_subcharges || [],
              sell_rates: v.sell_rates || {},
              remarks: v.remarks || '',
            }));
          })();
          if (existingSelected && existingSelected.length) {
            this.selectedSourcingVendors = existingSelected;
            this.hydrateSubCharges(this.selectedSourcingVendors);
          }
          this.activeVendorTab = 0; // Get Sourcing tab
          this.showVendorTabsDialog = true;
          this.hydrateSubCharges(this.sourcingVendors);
          if (this.sourcingVendors.length) {
            const first = this.sourcingVendors[0];
            this.sourcingExpandedKeys = { [String(first.id)]: true };
          }
        },
        error: (error) => {
          console.error('Error getting sourcing options:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to get sourcing options',
          });
        },
      });
  }

  // Updated getTariff method
  getTariff(lineItemId: number) {
    if (!this.currentEnquiry?.code) {
      this.saveEnquiry();
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please save the enquiry first before getting tariff options',
      });
      return;
    }

    this.executeGetTariff(lineItemId);
  }

  private executeGetTariff(lineItemId: number) {
    const lineItemIndex = Number(lineItemId) - 1;
    const enq = this.selectedEnquiry!;

    const li = this.lineItems[lineItemIndex];
    const selectedVendor = this.sourcingSelection || this.selectedSourcingVendors.find(v => v.enquiry_line_item_id === lineItemId);
    const sourcingList = selectedVendor
      ? [
          {
            vendor_no: selectedVendor.vendor_name || selectedVendor.vendor_no || selectedVendor.code,
            vendor_type: selectedVendor.vendor_type,
          },
        ]
      : undefined;
    this.currentVendorCriteria = {
      line_item_type: li?.type,
      service_area: li?.service_area,
      basis: li?.basis,
      department: enq.department,
      cargo_type: enq.cargo_type,
      from_location: li?.line_from_location || enq.from_location,
      from_location_type: li?.line_from_location_type || enq.location_type_from,
      to_location: li?.line_to_location || enq.to_location,
      to_location_type: li?.line_to_location_type || enq.location_type_to,
      effective_date_from: this.formatDateForAPI(enq.effective_date_from),
      effective_date_to: this.formatDateForAPI(enq.effective_date_to),
      service_type: enq.service_type,
      sourcing: sourcingList,
      lineItemId: lineItemId,
    };

    this.enquiryService
      .getTariffOptions(this.currentEnquiry?.code!, this.currentVendorCriteria)
      .subscribe({
        next: (options) => {
          this.tariffVendors = options.map((opt) => ({
            ...opt,
            enquiry_line_item_id: lineItemId,
            selected_subcharges: [],
            sell_rates: {},
            remarks: '',
            sub_charges: opt.sub_charges || this.normalizeCharges(opt.charges),
          }));
          this.filteredTariffVendors = [...this.tariffVendors];
          const li = this.selectedEnquiry?.line_items?.[lineItemIndex];
          const tariffSummary = li?.enquiry_summary?.[1];
          const prevTariff = tariffSummary?.selected_source_items || [];
          this.selectedTariffVendors = (prevTariff || []).map((v: any) => ({
            ...v,
            enquiry_line_item_id: lineItemId,
            selected_subcharges: v.selected_subcharges || [],
            sell_rates: v.sell_rates || {},
            remarks: v.remarks || '',
          }));
          this.activeVendorTab = 2; // Get Tariff tab
          this.showVendorTabsDialog = true;
          if (this.selectedTariffVendors.length) {
            this.hydrateSubCharges(this.selectedTariffVendors);
          }
          this.hydrateSubCharges(this.tariffVendors, true);
        },
        error: (error) => {
          console.error('Error getting tariff options:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to get tariff options',
          });
        },
      });
  }

  getTariffForVendor(vendor: any) {
    if (!this.selectedEnquiry) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Save enquiry first' });
      return;
    }
    const enq = this.selectedEnquiry!;
    const lineItemId = vendor?.enquiry_line_item_id || 1;
    const criteria: any = {
      sourcing: [
        {
          vendor_type: vendor.vendor_type,
        },
      ],
      effective_date_from: this.formatDateForAPI(enq.effective_date_from),
      effective_date_to: this.formatDateForAPI(enq.effective_date_to),
      lineItemId,
    };

    this.enquiryService
      .getTariffOptions(this.currentEnquiry?.code!, criteria)
      .subscribe({
        next: (options) => {
          this.tariffVendors = options.map((opt) => ({
            ...opt,
            enquiry_line_item_id: lineItemId,
            selected_subcharges: [],
            sell_rates: {},
            remarks: '',
            sub_charges: this.normalizeCharges(opt.charges),
          }));
          this.filteredTariffVendors = [...this.tariffVendors];
          this.selectedTariffVendors = [];
          this.activeVendorTab = 2; // Get Tariff tab
          this.showVendorTabsDialog = true;
          this.hydrateSubCharges(this.tariffVendors, true);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to get tariff for vendor' });
        },
      });
  }
  // Move selected vendors from Get Sourcing to Select Sourcing tab
  moveToSelectSourcing() {
    const selectedVendor = this.sourcingSelection;
    console.log('Selected sourcing vendors to move:', selectedVendor);
    if (!selectedVendor) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one vendor',
      });
      return;
    }

    const allSub = selectedVendor?.sub_charges || [];
    if (
      !selectedVendor?.selected_subcharges ||
      selectedVendor?.selected_subcharges.length === 0
    ) {
      selectedVendor.selected_subcharges = [...allSub];
      allSub.forEach((c: any) => (c.selected = true));
    }
    const selectedIds = new Set(
      (selectedVendor.selected_subcharges || []).map((sc: any) => sc.id)
    );
    const filteredSub = allSub.filter((c: any) => selectedIds.has(c.id));
    filteredSub.forEach((c: any) => (c.selected = true));
    const movedVendors = {
      ...selectedVendor,
      sub_charges: filteredSub,
      selected_subcharges: [...filteredSub],
    };

    const lineItemId =
      selectedVendor.enquiry_line_item_id ??
      this.currentVendorCriteria?.lineItemId ??
      (this.lineItems && this.lineItems.length ? this.lineItems[0]?.s_no : undefined);
    // Hard delete any prior saved vendor cards and sub-charges for this line item (both sourcing and tariff)
    this.enquiryService
      .deleteLineItemVendorData(this.currentEnquiry?.code!, lineItemId, 'all')
      .subscribe({
        next: () => {
          // Clear UI selections for this line item
          this.selectedSourcingVendors = this.selectedSourcingVendors.filter(
            (v) => v.enquiry_line_item_id !== lineItemId
          );
          this.selectedTariffVendors = this.selectedTariffVendors.filter(
            (v) => v.enquiry_line_item_id !== lineItemId
          );
          this.filteredTariffVendors = this.filteredTariffVendors.filter(
            (v) => v.enquiry_line_item_id !== lineItemId
          );

          // Add newly moved vendor
          this.selectedSourcingVendors = [movedVendors].map((srcVendor) => ({
            ...srcVendor,
            sub_charges: srcVendor.sub_charges?.map((sc: any) => ({
              ...sc,
              sell_rate_gst_vat: sc.gst_vat,
            })),
          }));

          // Persist the new sourcing vendor
          const ctx = this.currentVendorCriteria || {};
          const vendorToSave = {
            enquiry_line_item_id: selectedVendor.enquiry_line_item_id ?? ctx.lineItemId,
            master_type: 'sourcing',
            department: ctx.department,
            service_type: ctx.service_type,
            type: ctx.line_item_type,
            service_area: ctx.service_area,
            vendor_type: selectedVendor.vendor_type,
            vendor_name: selectedVendor.vendor_name,
            basis: selectedVendor.basis ?? ctx.basis,
            cargo: ctx.cargo_type,
            location_type_from: ctx.from_location_type,
            from_location: selectedVendor.from_location ?? ctx.from_location,
            location_type_to: ctx.to_location_type,
            to_location: selectedVendor.to_location ?? ctx.to_location,
            period_start_date: selectedVendor.effective_date ?? ctx.effective_date_from,
            period_end_date: selectedVendor.expiry_date ?? ctx.effective_date_to,
            charges: selectedVendor.selected_subcharges,
          };

          this.enquiryService
            .addVendorCards(this.currentEnquiry?.code!, [vendorToSave], {
              masterType: 'sourcing',
              lineItemId: ctx.lineItemId,
            })
            .subscribe({
              next: (res) => {
                try {
                  const inserted = (res && res.inserted) ? res.inserted : [];
                  const cardId = inserted.length ? inserted[0].id : undefined;
                  if (cardId) {
                    this.selectedSourcingVendors = this.selectedSourcingVendors.map((v) => ({ ...v, card_id: cardId }));
                    this.enquiryService
                      .selectLineItemVendorCards(this.currentEnquiry?.code!, Number(lineItemId), [cardId], 'sourcing')
                      .subscribe({ next: () => {}, error: () => {} });
                  }
                } catch {}
              },
              error: (error) => {
                console.error('Error saving sourcing vendors:', error);
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save sourcing vendors' });
              },
            });

          this.sourcingSelection = null;
          this.activeVendorTab = 1;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `${selectedVendor.vendor_name} vendor moved to Select Sourcing` });
        },
        error: (err) => {
          console.error('Failed to clear prior vendor data:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reset previous vendor data for this line item' });
        },
      });
    // removed duplicate save block

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `${selectedVendor.vendor_name} vendor moved to Select Sourcing`,
    });
  }

  // Move selected vendors from Get Tariff to Select Tariff tab
  moveToSelectTariff() {
    const selected = Array.isArray(this.selectedTariffSelection)
      ? [...this.selectedTariffSelection]
      : [];
    if (selected.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one vendor',
      });
      return;
    }

    this.selectedTariffVendors = [...this.selectedTariffVendors, ...selected].map((vendor) => {
      if (!vendor.sell_rates) vendor.sell_rates = {};
      (vendor.sub_charges || []).forEach((sc: any) => {
        const amt = sc.amount ?? sc.charges ?? 0;
        if (vendor.sell_rates[sc.id] === undefined) vendor.sell_rates[sc.id] = amt;
        if (!sc.sell_rate_currency) sc.sell_rate_currency = sc.currency;
        if (sc.sell_rate_gst_vat === undefined)
          sc.sell_rate_gst_vat = sc.gst_vat ?? sc.gst_rate ?? sc.vat_rate ?? 0;
      });
      return vendor;
    });
    this.selectedTariffVendors.forEach((vendor) => {
      if (
        !vendor.selected_subcharges ||
        vendor.selected_subcharges.length === 0
      ) {
        vendor.selected_subcharges = [...(vendor.sub_charges || [])];
      }
      (vendor.sub_charges || []).forEach((c: any) => {
        c.selected = vendor.selected_subcharges?.some(
          (sc: any) => sc.id === c.id
        );
      });
    });

    // Persist tariff vendors immediately
    const ctxT = this.currentVendorCriteria || {};
    const vendorsToSaveT = selected.map((vendor) => ({
      enquiry_line_item_id: vendor.enquiry_line_item_id ?? ctxT.lineItemId,
      master_type: 'tariff',
      department: ctxT.department,
      service_type: ctxT.service_type,
      type: ctxT.line_item_type,
      service_area: ctxT.service_area,
      vendor_type: vendor.vendor_type,
      vendor_name: vendor.vendor_name,
      basis: vendor.basis ?? ctxT.basis,
      cargo: ctxT.cargo_type,
      location_type_from: ctxT.from_location_type,
      from_location: vendor.from_location ?? ctxT.from_location,
      location_type_to: ctxT.to_location_type,
      to_location: vendor.to_location ?? ctxT.to_location,
      period_start_date: vendor.effective_date ?? ctxT.effective_date_from,
      period_end_date: vendor.expiry_date ?? ctxT.effective_date_to,
      charges: vendor.selected_subcharges?.length
        ? vendor.selected_subcharges
        : vendor.sub_charges || [],
    }));

    this.enquiryService
      .addVendorCards(this.currentEnquiry?.code!, vendorsToSaveT, {
        masterType: 'tariff',
        lineItemId: ctxT.lineItemId,
      })
      .subscribe({
        next: (res) => {
          try {
            const inserted = (res && res.inserted) ? res.inserted : [];
            // Attach returned card ids to the corresponding selectedTariffVendors
            inserted.forEach((row: any, idx: number) => {
              const target = this.selectedTariffVendors[idx];
              if (target) target.card_id = row.id;
            });
          } catch {}
        },
        error: (error) => {
          console.error('Error saving tariff vendors:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save tariff vendors',
          });
        },
      });

    // Remove from tariff vendors and filtered list
    const selectedIds = new Set(selected.map((s: any) => s.id));
    this.tariffVendors = this.tariffVendors.filter((v) => !selectedIds.has(v.id));
    this.filteredTariffVendors = this.filteredTariffVendors.filter((v) => !selectedIds.has(v.id));
    this.selectedTariffSelection = [];

    // Move to Select Tariff tab
    this.activeVendorTab = 3;

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `${selected.length} vendor(s) moved to Select Tariff`,
    });
  }

  // Toggle subcharge selection for tariff
  toggleTariffSubcharge(vendor: any, subcharge: any) {
    const index = vendor.selected_subcharges.findIndex(
      (sc: any) => sc.id === subcharge.id
    );
    if (index > -1) {
      vendor.selected_subcharges.splice(index, 1);
      delete vendor.sell_rates[subcharge.id];
    } else {
      vendor.selected_subcharges.push(subcharge);
      vendor.sell_rates[subcharge.id] = subcharge.amount || 0;
    }
  }

  removeSelectedSourcingVendor(vendor: any) {
    this.selectedSourcingVendors = this.selectedSourcingVendors.filter(
      (v) => v.id !== vendor.id
    );
    this.messageService.add({
      severity: 'info',
      summary: 'Removed',
      detail: `${vendor.vendor_name} removed from Select Sourcing`,
    });
  }

  removeSelectedTariffVendor(vendor: any) {
    this.selectedTariffVendors = this.selectedTariffVendors.filter(
      (v) => v.id !== vendor.id
    );
    this.messageService.add({
      severity: 'info',
      summary: 'Removed',
      detail: `${vendor.vendor_name} removed from Select Tariff`,
    });
  }
  saveTariffVendors() {
    const code = this.currentEnquiry?.code!;
    const requests = this.selectedTariffVendors
      .filter((v) => v.card_id)
      .map((vendor) => {
        const updates = (vendor.selected_subcharges || []).map((sc: any) => ({
          id: sc.id,
          charge_name: sc.charge_name || sc.name,
          currency: sc.currency,
          sell_rate_currency: sc.sell_rate_currency || sc.currency,
          sell_rate: vendor.sell_rates?.[sc.id] ?? sc.sell_rate ?? sc.amount ?? sc.charges,
          gst_vat: sc.gst_vat ?? sc.gst_rate,
          remarks: sc.remarks,
        }));
        return this.enquiryService.updateVendorSubCharges(code, vendor.card_id, updates);
      });

    if (requests.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No saved tariff vendors to update',
      });
      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Tariff sub-charges updated',
        });
        this.showVendorTabsDialog = false;
        this.loadEnquiry(code);
      },
      error: (error) => {
        console.error('Error updating tariff sub-charges:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update tariff sub-charges',
        });
      },
    });
  }
  // Calculate total charges for display
  calculateTotalCharges(vendor: any): number {
    return vendor.selected_subcharges.reduce((total: number, sc: any) => {
      return total + (vendor.sell_rates[sc.id] || sc.amount || 0);
    }, 0);
  }

  // Filter vendors based on location and service area
  filterSourcingVendors() {
    // Implement filtering logic based on your criteria
    // This would filter this.sourcingVendors based on currentVendorCriteria
  }

  filterTariffVendors() {
    // Implement filtering logic based on your criteria
    // This would filter this.tariffVendors based on currentVendorCriteria
  }
  applyManualTariffFilter() {
    this.filteredTariffVendors = this.tariffVendors.filter((vendor) => {
      let matches = true;
      const norm = (s: any) => (s ?? '').toString().trim().toLowerCase();
      const normType = (s: any) => norm(s).replace(/[^a-z0-9]/g, '');
      const findTypeByValue = (val: string) => {
        const v = (val || '').toString();
        const rec = (this.allLocations || []).find(
          (l: any) => l.code === v || norm(l.name) === norm(v)
        );
        return rec ? rec.type : '';
      };

      if (this.tariffFilter.department) {
        const vDept = vendor.department || vendor.department_name || '';
        if (norm(vDept) !== norm(this.tariffFilter.department)) matches = false;
      }

      if (this.tariffFilter.service_type) {
        const vSt = vendor.service_type || vendor.shipping_type || vendor.type || '';
        const fltSt = this.tariffFilter.service_type;
        if (norm(vSt) !== norm(fltSt) && norm(vSt) !== norm((this.serviceTypeFilterOptions.find((o:any)=>o.value===fltSt)||{}).label?.split(' - ')[1])) {
          matches = false;
        }
      }

      if (
        this.tariffFilter.service_area &&
        vendor.service_area !== this.tariffFilter.service_area
      ) {
        matches = false;
      }

      if (this.tariffFilter.from_location_type) {
        const vfType = normType(vendor.from_location_type) || normType(findTypeByValue(vendor.from_location_code || vendor.from_location));
        const fltType = normType(this.tariffFilter.from_location_type);
        if (vfType !== fltType) matches = false;
      }
      if (this.tariffFilter.from_location) {
        const code = (this.tariffFilter.from_location || '').toString();
        const rec = (this.allLocations || []).find((l: any) => l.code === code);
        const name = rec ? (rec.name || '') : '';
        const vloc = (vendor.from_location || '').toString();
        const vcode = (vendor.from_location_code || '').toString();
        const normText = (s: any) => (s ?? '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
        const ok =
          normText(vloc) === normText(code) ||
          normText(vloc) === normText(name) ||
          normText(vcode) === normText(code) ||
          normText(vloc).includes(normText(name)) ||
          normText(vloc).includes(normText(code));
        if (!ok) matches = false;
      }

      if (this.tariffFilter.to_location_type) {
        const vtType = normType(vendor.to_location_type) || normType(findTypeByValue(vendor.to_location_code || vendor.to_location));
        const fltTypeTo = normType(this.tariffFilter.to_location_type);
        if (vtType !== fltTypeTo) matches = false;
      }
      if (this.tariffFilter.to_location) {
        const code = (this.tariffFilter.to_location || '').toString();
        const rec = (this.allLocations || []).find((l: any) => l.code === code);
        const name = rec ? (rec.name || '') : '';
        const vloc = (vendor.to_location || '').toString();
        const vcode = (vendor.to_location_code || '').toString();
        const normText = (s: any) => (s ?? '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
        const ok =
          normText(vloc) === normText(code) ||
          normText(vloc) === normText(name) ||
          normText(vcode) === normText(code) ||
          normText(vloc).includes(normText(name)) ||
          normText(vloc).includes(normText(code));
        if (!ok) matches = false;
      }

      

      return matches;
    });
  }

  // Clear tariff filters
  clearTariffFilters() {
    this.tariffFilter = {};
    this.filteredTariffVendors = [...this.tariffVendors];
  }
  openChargesDialog(vendor: any) {
    this.toggleVendorChargesInline(vendor, 'sourcing');
  }

  saveSelectedSubCharges() {
    if (this.chargesDialogVendor) {
      if (
        !this.chargesDialogVendor.selected_subcharges ||
        this.chargesDialogVendor.selected_subcharges.length === 0
      ) {
        this.chargesDialogVendor.selected_subcharges = [
          ...(this.chargesDialogVendor.sub_charges || []),
        ];
      }
      this.chargesDialogVendor.selected = true;
    }
    this.chargesDialogVisible = false;
  }

  toggleVendorChargesInline(vendor: any, type: 'sourcing' | 'tariff') {
    if (!vendor.sell_rates) vendor.sell_rates = {};
    vendor.showCharges = !vendor.showCharges;
    if (vendor.showCharges) {
      if (type === 'sourcing') {
        if (!vendor.sub_charges || vendor.sub_charges.length === 0) {
          this.sourceService.getSubCharges(Number(vendor.id)).subscribe({
            next: (list) => {
              vendor.sub_charges = Array.isArray(list) ? list : [];
              if (!vendor.selected_subcharges || vendor.selected_subcharges.length === 0) {
                vendor.selected_subcharges = [...vendor.sub_charges];
              }
              (vendor.sub_charges || []).forEach((s: any) => {
                if (typeof s.selected === 'undefined') s.selected = true;
                if (vendor.sell_rates[s.id] === undefined)
                  vendor.sell_rates[s.id] = s.amount || s.charges || 0;
              });
              this.cdr.detectChanges();
            },
          });
        } else {
          if (!vendor.selected_subcharges || vendor.selected_subcharges.length === 0) {
            vendor.selected_subcharges = [...vendor.sub_charges];
          }
          (vendor.sub_charges || []).forEach((s: any) => {
            if (typeof s.selected === 'undefined') s.selected = true;
            if (vendor.sell_rates[s.id] === undefined)
              vendor.sell_rates[s.id] = s.amount || s.charges || 0;
          });
        }
      } else {
        if (!vendor.sub_charges || vendor.sub_charges.length === 0) {
          const tid = vendor.id;
          this.enquiryService.getTariffSubCharges(Number(tid)).subscribe({
            next: (list) => {
              vendor.sub_charges = Array.isArray(list) ? list : [];
              if (!vendor.selected_subcharges || vendor.selected_subcharges.length === 0) {
                vendor.selected_subcharges = [...vendor.sub_charges];
              }
              (vendor.sub_charges || []).forEach((s: any) => {
                if (typeof s.selected === 'undefined') s.selected = true;
                if (vendor.sell_rates[s.id] === undefined)
                  vendor.sell_rates[s.id] = s.amount || s.charges || 0;
              });
              this.cdr.detectChanges();
            },
          });
        } else {
          if (!vendor.selected_subcharges || vendor.selected_subcharges.length === 0) {
            vendor.selected_subcharges = [...vendor.sub_charges];
          }
          (vendor.sub_charges || []).forEach((s: any) => {
            if (typeof s.selected === 'undefined') s.selected = true;
            if (vendor.sell_rates[s.id] === undefined)
              vendor.sell_rates[s.id] = s.amount || s.charges || 0;
          });
        }
      }
    }
  }

  // Save sourcing vendors (PUT updates for sub-charges)
  saveSourcingVendors() {
    const code = this.currentEnquiry?.code!;
    const lineItemId = this.currentVendorCriteria.lineItemId;

    const requests = this.selectedSourcingVendors
      .filter((v) => v.card_id)
      .map((vendor) => {
        const updates = (vendor.selected_subcharges || []).map((sc: any) => ({
          id: sc.id,
          charge_name: sc.charge_name || sc.name,
          currency: sc.currency,
          sell_rate_currency: sc.sell_rate_currency || sc.currency,
          sell_rate: vendor.sell_rates?.[sc.id] ?? sc.sell_rate ?? sc.amount ?? sc.charges,
          gst_vat: sc.gst_vat ?? sc.gst_rate,
          remarks: sc.remarks,
        }));
        return this.enquiryService.updateVendorSubCharges(code, vendor.card_id, updates);
      });

    if (requests.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No saved vendor cards to update',
      });
      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Saved',
          detail: 'Sourcing sub-charges updated',
        });
        this.showVendorTabsDialog = false;
        this.loadEnquiry(code);
      },
      error: (error) => {
        console.error('Error updating sourcing sub-charges:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update sourcing sub-charges',
        });
      },
    });
  }
  private normalizeCharges(charges: any): any[] {
    if (!charges) return [];
    if (Array.isArray(charges)) return charges;
    if (typeof charges === 'string') {
      try {
        const parsed = JSON.parse(charges);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    if (typeof charges === 'object') {
      return charges.items && Array.isArray(charges.items) ? charges.items : [];
    }
    return [];
  }

  private hydrateSubCharges(vendors: any[], updateFiltered: boolean = false) {
    console.log('Vendor value before hydrating sub charges:', vendors);
    if (!vendors || vendors.length === 0) return;
    const code = this.currentEnquiry?.code!;
    const requests = vendors.map((v) => {
      const cardId = v.card_id || v.master_id;
      if (cardId) {
        return this.enquiryService
          .getVendorSubCharges(code, Number(cardId))
          .pipe(catchError(() => of([])));
      }
      if (Array.isArray(v.sub_charges) && v.sub_charges.length > 0) {
        return of(v.sub_charges);
      }
      return this.sourceService
        .getSubCharges(Number(v.id))
        .pipe(catchError(() => of([])));
    });
    forkJoin(requests).subscribe({
      next: (subcharges) => {
        subcharges.forEach((list, idx) => {
          vendors[idx].sub_charges = Array.isArray(list) ? list : [];
          if (
            !vendors[idx].selected_subcharges ||
            vendors[idx].selected_subcharges.length === 0
          ) {
            vendors[idx].selected_subcharges = [...vendors[idx].sub_charges];
          }
          if (!vendors[idx].sell_rates) vendors[idx].sell_rates = {};
          (vendors[idx].sub_charges || []).forEach((sc: any) => {
            const amt = sc.amount ?? sc.charges ?? 0;
            if (vendors[idx].sell_rates[sc.id] === undefined) {
              vendors[idx].sell_rates[sc.id] = amt;
            }
            if (!sc.sell_rate_currency) sc.sell_rate_currency = sc.currency;
            if (sc.sell_rate_gst_vat === undefined)
              sc.sell_rate_gst_vat = sc.gst_vat ?? sc.gst_rate ?? sc.vat_rate ?? 0;
          });
        });
        if (updateFiltered) {
          this.filteredTariffVendors = [...vendors];
        }
        console.log('Hydrated sub charges for vendors:', vendors);
      },
      error: (err) => {
        console.error('Error hydrating sub charges:', err);
      },
    });
  }
  //11/15/2025

  // Get only finalized sources for a line item
  getFinalizedSourcesForLineItem(item: EnquiryLineItem): any[] {
    if (!item.enquiry_summary || item.enquiry_summary.length === 0) {
      return [];
    }

    return item.enquiry_summary.filter((summary) => {
      // Check if summary has finalized items
      return summary.finalizedItems && summary.finalizedItems.length > 0;
    });
  }

  // Get finalized vendors for a specific summary
  getFinalizedVendorsForSummary(summary: any): any[] {
    if (!summary.finalizedItems || summary.finalizedItems.length === 0) {
      return [];
    }

    return summary.finalizedItems.map((vendor: any, index: number) => {
      return {
        ...vendor,
        sourced_no: vendor.sourced_no || `${index + 1}`,
        charge: vendor.charges || vendor.charge,
        currency: vendor.currency || vendor.currency_code,
        sourced_time: vendor.created_at || vendor.sourced_time,
        remarks: vendor.negotiated_remarks || vendor.remarks,
      };
    });
  }

  // Filter line items to only show those with finalized vendors
  getLineItemsWithFinalizedSources(): EnquiryLineItem[] {
    if (!this.lineItems || this.lineItems.length === 0) {
      return [];
    }

    return this.lineItems.filter((item) => {
      const finalizedSources = this.getFinalizedSourcesForLineItem(item);
      return finalizedSources && finalizedSources.length > 0;
    });
  }

  addSelectedVendors() {
    console.log(
      'list of vendors selected from the sourcing:',
      this.selectedVendors,
      'current enquiry:',
      this.currentEnquiry
    );

    this.selectedVendors.forEach((vendor) => {
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
        } else if (
          typeof vendor.charges === 'object' &&
          !Array.isArray(vendor.charges) &&
          (vendor.charges as any).amount
        ) {
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
        const matchingLineItems = this.lineItems.filter(
          (lineItem) =>
            lineItem.basis &&
            lineItem.basis.toLowerCase() === vendorBasis.toLowerCase()
        );

        // Sum quantities from matching line items
        mappedQuantity = matchingLineItems.reduce(
          (total, lineItem) => total + (Number(lineItem.quantity) || 0),
          0
        );
      }

      const vendorCard: EnquiryVendorCard = {
        vendor_name: vendor.vendor_name,
        vendor_type: vendor.vendor_type,
        is_active: false,
        charges: chargeValue, // Store as simple numeric value
        source_type: this.currentVendorSource,
        source_id: vendor.id,
        // Store additional sourcing details for display
        mode: vendor.mode,
        from_location: vendor.from_location,
        to_location: vendor.to_location,
        basis: vendorBasis,
        vendor_code: (vendor as any).vendor_code || '',
        effective_date: (vendor as any).effective_date || '',
        expiry_date:
          (vendor as any).expiry_date || (vendor as any).end_date || '',
        currency: (vendor as any).currency || 'N/A',
        quantity: mappedQuantity,
        remarks: '',
        enquiry_line_item_id:
          Number(`${(vendor as any).enquiry_line_item_id}`) || -1,
      };
      this.vendorCards.push(vendorCard);
    });

    console.log(
      'DEBUG List of selected vendors stored in the vendorCards:',
      this.vendorCards
    );
    // Push the vendors list to the db for retrieval
    this.saveVendorCards();
    this.showVendorSelectionDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `${this.selectedVendors.length} vendor(s) added successfully`,
    });
    console.log('enquiry value during vendor card adding', this.lineItems);
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
      case 'Active':
        return 'text-green-600 font-semibold';
      case 'Inactive':
        return 'text-red-600 font-semibold';
      case 'Pending':
        return 'text-yellow-600 font-semibold';
      default:
        return 'text-gray-600 font-semibold';
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

  // Mail methods
  canGenerateMail(): boolean {
    return (
      this.vendorCards.some((card) => card.is_active) && this.enquiryForm.valid
    );
  }

  generateMail() {
    const activeVendor = this.vendorCards.find((card) => card.is_active);
    if (!activeVendor) return;

    const enquiryData: Enquiry = {
      ...this.enquiryForm.value,
      line_items: this.lineItems,
      enquiry_no: this.currentEnquiry?.enquiry_no || 'NEW',
    };

    this.mailContent = this.enquiryService.generateMailTemplateString(
      enquiryData,
      activeVendor
    );
    this.showMailDialog = true;
  }

  copyMailToClipboard() {
    navigator.clipboard.writeText(this.mailContent).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Mail content copied to clipboard',
      });
    });
  }

  // Save and confirm methods
  saveEnquiry() {
    if (!this.selectedEnquiry) return;

    console.log(
      'Selected Line Items for enquiry Id,',
      this.selectedEnquiry.id,
      'is,',
      this.selectedLineItems
    );
    console.log(
      'DEBUG: selected enquiry value from save enquiry',
      this.selectedEnquiry
    );
    // check and assign the id to line items which doesn't have before enquiry creation
    // this.assignIdToLineItems();
    // assigning the selected enquiry to current enquiry to avoid undefined error in confirm enquiry
    this.currentEnquiry = { ...this.selectedEnquiry };

    const enquiryData: Enquiry = {
      ...this.selectedEnquiry,
      line_items: this.lineItems,
      is_new_customer: this.isNewCustomer,
      date: this.formatDateForAPI(this.selectedEnquiry.date),
      effective_date_from: this.formatDateForAPI(
        this.selectedEnquiry.effective_date_from
      ),
      effective_date_to: this.formatDateForAPI(
        this.selectedEnquiry.effective_date_to
      ),
      name: this.authService.getUserName()!,
    };

    // For automatic series, ensure code is empty so backend generates it (only for new records)
    if (!this.isManualSeries && this.selectedEnquiry.isNew) {
      enquiryData.code = '';
    }

    const saveOperation = this.selectedEnquiry.id
      ? this.enquiryService.updateEnquiry(
          this.selectedEnquiry.code!,
          enquiryData
        )
      : this.enquiryService.createEnquiry(enquiryData);

    saveOperation.subscribe({
      next: (response: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.selectedEnquiry?.code
            ? 'Enquiry updated successfully'
            : 'Enquiry created successfully',
        });

        console.log(
          'save operation response for save enquiry,',
          response,
          'selected enquiry model 2 way data binding value,',
          this.selectedEnquiry
        );

        if (this.selectedEnquiry?.code === 'MAA_FF_ENQ' && response.code) {
          console.log('updating the value selected enquiry value');
          // New enquiry created, update the selectedEnquiry with auto-generated values
          this.selectedEnquiry!.id = response.id;
          this.selectedEnquiry!.enquiry_no = response.enquiry_no;
          this.selectedEnquiry!.code = response.code;

          // Update current enquiry for vendor cards
          this.currentEnquiry = {
            ...enquiryData,
            id: response.id,
            enquiry_no: response.enquiry_no,
            code: response.code,
          };

          // Show success message with generated enquiry number
          this.messageService.add({
            severity: 'info',
            summary: 'Enquiry Number Generated',
            detail: `Enquiry Number: ${response.enquiry_no}`,
            life: 5000,
          });

          // if (this.vendorCards.length > 0) {
          //   this.saveVendorCards();
          // }
        }

        const enqId = response.id || this.selectedEnquiry?.id;
        if (enqId) {
          this.carriageService
            .saveEnquiryCarriageMapping(enqId, this.carriageMappings)
            .subscribe();
        }

        this.enquiryService
          .updateEnquiryLineItemSelection(this.selectedEnquiry?.code || '', {
            selectedLineItems: this.selectedLineItems,
          })
          .subscribe({
            next: (response: any) => {
              console.log(
                'Update Enquiry Line Item Selection response,',
                response
              );
            },
            error: (error: any) => {},
          });

        this.loadEnquiries(); // Refresh the table
        this.loadEnquiries().subscribe({
          next: () => {
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error reloading enquiries after save:', err);
          },
        });

        // Don't hide dialog immediately for new enquiries so user can see the generated number
        if (this.selectedEnquiry?.code) {
          console.log('Save Enquiry hide dialog', this.selectedEnquiry);
          // this.hideDialog();
        }
      },
      error: (error: any) => {
        console.error('Error saving enquiry:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save enquiry',
        });
      },
    });
  }

  canConfirmEnquiry(): boolean {
    console.log(
      'DEBUG: values params in canConfirmEnquiry,',
      this.enquiryForm,
      'lineItems,',
      this.lineItems,
      'vendor cards,',
      this.vendorCards,
      'Current Enquiry,',
      this.currentEnquiry
    );
    // this.enquiryForm.valid &&
    return (
      this.lineItems.length > 0 &&
      this.vendorCards.some((card) => card.is_active) &&
      this.currentEnquiry?.code !== undefined
    );
  }

  confirmEnquiry() {
    if (!this.canConfirmEnquiry() || !this.currentEnquiry?.code) return;

    this.confirmationService.confirm({
      message:
        'Are you sure you want to confirm this enquiry? This will create a booking.',
      accept: () => {
        this.enquiryService
          .confirmEnquiry(this.currentEnquiry!.code!)
          .subscribe({
            next: (response) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Enquiry confirmed successfully. Booking ${response.booking_no} created.`,
              });
              this.enquiryForm.patchValue({ status: 'Confirmed' });
            },
            error: (error) => {
              console.error('Error confirming enquiry:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to confirm enquiry',
              });
            },
          });
      },
    });
  }

  saveVendorCards() {
    if (!this.currentEnquiry?.code || this.vendorCards.length === 0) return;

    console.log('Save vendor cards vendor Cards list,', this.vendorCards);
    console.log(
      'current enquiry,',
      this.currentEnquiry,
      'Selected Enquiry vendor card,',
      this.selectedEnquiry
    );
    this.enquiryService
      .addVendorCards(
        this.currentEnquiry.code,
        this.vendorCards,
        this.selectedVendorType
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Vendor cards saved successfully',
          });
          // removing all the selected vendor type
          this.selectedVendorType = {};
          this.loadEnquiry(this.currentEnquiry?.code!);
        },
        error: (error) => {
          console.error('Error saving vendor cards:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save vendor cards',
          });
        },
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
      detail: 'Navigate to enquiry list view',
    });
  }

  clearForm() {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to clear the form? All unsaved data will be lost.',
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
            cargo_type: '',
            from_location: '',
            to_location: '',
            location_type_from: '',
            location_type_to: '',
            service_type: '',
            effective_date_from: '',
            effective_date_to: '',
            status: 'Open',
            remarks: '',
            line_items: [],
          };
        }
        this.lineItems = [];
        this.vendorCards = [];
        this.isNewCustomer = false;
        this.addLineItem();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Form cleared successfully',
        });
      },
    });
  }
  private assignIdToLineItems() {
    // Assigning the id to the line items if not present
    this.lineItems.forEach((lineItem) => {
      if (!lineItem.id) {
        let id = Math.floor(Math.random() * 97); // Initial random id
        let attempt = 0;

        // Try generating a unique id, limit attempts to 10
        while (
          this.lineItems.some((lItem) => lItem.id === id) &&
          attempt < 10
        ) {
          id = Math.floor(Math.random() * (attempt === 5 ? 131 : 97)); // Change random range on attempt 5
          attempt++;
        }

        if (attempt === 10) {
          // If we reach 10 attempts, show an error message and stop
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Reached maximum line item for this enquiry.',
          });
          return; // Stop execution for this line item if unique id cannot be generated
        }

        // Directly assign the generated id to the line item
        lineItem.id = id;
      }
    });

    console.log('Updated lineItems:', this.lineItems);
  }

  private loadMappedEnquirySeriesCode() {
    const context = this.contextService.getContext();

    // Try context-based mapping first
    this.mappingService
      .findMappingByContext(
        'enquiryNo',
        context.companyCode || '',
        context.branchCode || '',
        context.departmentCode || '',
        context.serviceType || ''
      )
      .subscribe({
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
              },
            });
          }
        },
        error: () => {
          this.isManualSeries = true;
        },
      });
  }

  private checkSeriesManualFlag() {
    if (this.mappedEnquirySeriesCode) {
      this.numberSeriesService.getAll().subscribe({
        next: (seriesList: any[]) => {
          const found = seriesList.find(
            (s: any) => s.code === this.mappedEnquirySeriesCode
          );
          this.isManualSeries = !!(found && found.is_manual);
          // Do not pre-fill code for auto series; keep empty until save
        },
        error: () => {
          this.isManualSeries = true;
        },
      });
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.enquiryForm.controls).forEach((key) => {
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
      const availableTypes = [...new Set(this.allLocations.map((l) => l.type))];
      console.log('Available location types in data:', availableTypes);

      const filteredLocations = this.allLocations.filter((l) => {
        console.log(
          `Comparing location type '${l.type}' with selected '${
            this.selectedEnquiry!.location_type_from
          }'`
        );
        return l.type === this.selectedEnquiry!.location_type_from;
      });
      console.log('Filtered from locations:', filteredLocations.length);

      // If no exact match, try case-insensitive comparison
      if (filteredLocations.length === 0) {
        const caseInsensitiveFiltered = this.allLocations.filter(
          (l) =>
            l.type?.toLowerCase() ===
            this.selectedEnquiry!.location_type_from?.toLowerCase()
        );
        console.log(
          'Case-insensitive filtered locations:',
          caseInsensitiveFiltered.length
        );

        this.fromLocationOptions = caseInsensitiveFiltered.map((l) => ({
          label: `${l.code} - ${l.name}`,
          value: l.code,
        }));
      } else {
        this.fromLocationOptions = filteredLocations.map((l) => ({
          label: `${l.code} - ${l.name}`,
          value: l.code,
        }));
      }
    } else {
      // If no location type selected, show all locations formatted as CODE - NAME
      this.fromLocationOptions = this.allLocations.map((l) => ({
        label: `${l.code} - ${l.name}`,
        value: l.code,
      }));
    }
    console.log('From location options:', this.fromLocationOptions.length);
  }

  filterToLocations() {
    console.log(
      'Filtering to locations for type:',
      this.selectedEnquiry?.location_type_to
    );
    console.log('All locations:', this.allLocations.length);

    if (this.selectedEnquiry?.location_type_to) {
      // Debug: Log all location types to see what's available
      const availableTypes = [...new Set(this.allLocations.map((l) => l.type))];
      console.log('Available location types in data:', availableTypes);

      const filteredLocations = this.allLocations.filter((l) => {
        console.log(
          `Comparing location type '${l.type}' with selected '${
            this.selectedEnquiry!.location_type_to
          }'`
        );
        return l.type === this.selectedEnquiry!.location_type_to;
      });
      console.log('Filtered to locations:', filteredLocations.length);

      // If no exact match, try case-insensitive comparison
      if (filteredLocations.length === 0) {
        const caseInsensitiveFiltered = this.allLocations.filter(
          (l) =>
            l.type?.toLowerCase() ===
            this.selectedEnquiry!.location_type_to?.toLowerCase()
        );
        console.log(
          'Case-insensitive filtered locations:',
          caseInsensitiveFiltered.length
        );

        this.toLocationOptions = caseInsensitiveFiltered.map((l) => ({
          label: `${l.code} - ${l.name}`,
          value: l.code,
        }));
      } else {
        this.toLocationOptions = filteredLocations.map((l) => ({
          label: `${l.code} - ${l.name}`,
          value: l.code,
        }));
      }
    } else {
      // If no location type selected, show all locations formatted as CODE - NAME
      this.toLocationOptions = this.allLocations.map((l) => ({
        label: `${l.code} - ${l.name}`,
        value: l.code,
      }));
    }
    console.log('To location options:', this.toLocationOptions.length);
  }
}
