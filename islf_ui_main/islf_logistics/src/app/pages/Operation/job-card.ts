import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable, forkJoin, combineLatest, Subject } from 'rxjs';
import { take, takeUntil, map } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';

import { JobCardService, JobCardRecord } from '../../services/job-card.service';
import { BookingService } from '../../services/booking.service';
import { ContextService } from '../../services/context.service';
import { MasterCacheService } from '../../services/master-cache.service';
import { ConfigService } from '../../services/config.service';
import { ConfigDatePipe } from '../../pipes/config-date.pipe';
import { HasPermissionDirective } from '../../directives/has-permission.directive';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    TableModule,
    CalendarModule,
    TooltipModule,
    RadioButtonModule,
    ConfigDatePipe,
    ConfirmDialogModule,
    BadgeModule,
    TabViewModule,
    InputNumberModule,
    HasPermissionDirective,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog appendTo="body"></p-confirmDialog>

    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <span class="text-xl font-bold">Job Card Dashboard</span>
      </div>

      <!-- Main Grid -->
      <p-table #dt [value]="jobCards" [lazy]="true" (onLazyLoad)="loadJobCards($event)" [totalRecords]="totalRecords" [paginator]="true" [rows]="configService.getSystemConfig().maxRecordsPerPage" [rowsPerPageOptions]="[5, 10, 20, 50]" dataKey="job_card_no" [showGridlines]="true">
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <div class="flex gap-2">
              <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Job Card', action: 'write' }">
                <button pButton label="Create Job Card" icon="pi pi-plus" (click)="openCreateDialog()"></button>
              </ng-container>
            </div>
            <div class="flex gap-2">
              <span class="p-input-icon-left">
                <input pInputText type="text" (input)="dt.filterGlobal($any($event.target).value, 'contains')" placeholder="Search..." />
              </span>
            </div>
          </div>
        </ng-template>
        
        <ng-template pTemplate="header">
          <tr>
            <th>Date</th>
            <th>Job No</th>
            <th>Linked Booking No</th>
            <th>Company Name</th>
            <th>Department</th>
            <th>Service Type</th>
            <th>From</th>
            <th>To</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </ng-template>
        
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.job_date | configDate }}</td>
            <td>{{ row.job_card_no }}</td>
            <td>
              <span *ngIf="row.booking_no" class="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold border border-green-200">
                {{ row.booking_no }}
              </span>
              <span *ngIf="!row.booking_no" class="text-gray-400 text-xs italic">Manual</span>
            </td>
            <td>{{ row.company_name }}</td>
            <td>{{ row.department }}</td>
            <td>{{ row.service_type }}</td>
            <td>{{ locName(row.from_location) }}</td>
            <td>{{ locName(row.to_location) }}</td>
              <td>
                <p-tag [value]="row.disabled ? (row.owner_job || 'Allocated') : 'Available'" [severity]="row.disabled ? 'warning' : 'success'"></p-tag>
              </td>
            <td>
              <div class="flex gap-2 justify-center">
                <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Job Card', action: 'write' }">
                  <button pButton icon="pi pi-pencil" class="p-button-sm p-button-warning" (click)="openEditDialog(row.job_card_no)" pTooltip="Edit Job Card" tooltipPosition="top"></button>
                </ng-container>
                
                <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Job Card', action: 'write' }">
                  <button *ngIf="row.status === 'Closed'" pButton icon="pi pi-refresh" class="p-button-sm p-button-success" (click)="reopenJobCard(row.id)" pTooltip="Reopen Job Card" tooltipPosition="top"></button>
                </ng-container>

                <ng-container *appHasPermission="{ module: 'Operations', subModule: 'Job Card', action: 'delete' }">
                  <button pButton icon="pi pi-trash" class="p-button-sm p-button-danger" (click)="deleteJobCard(row.id)" pTooltip="Delete Job Card" tooltipPosition="top"></button>
                </ng-container>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <!-- INITIALIZATION DIALOG -->
    <p-dialog header="Link Booking" [(visible)]="showInitializationDialog" [modal]="true" [draggable]="false" [resizable]="false" [style]="{ width: '95vw', maxWidth: '95vw' }" [contentStyle]="{ height: '70vh', overflow: 'auto' }">

      <!-- Filter Panel -->
      <div class="border-2 border-slate-200 rounded-lg p-4 bg-slate-50 mb-4">
        <div class="grid grid-cols-12 gap-x-4 gap-y-3">

          <!-- Row 1: Department + Service Type -->
          <div class="col-span-12 md:col-span-6">
            <label class="block mb-1 font-semibold text-slate-600 text-sm">Department</label>
            <p-dropdown
              [options]="departmentOptions"
              [(ngModel)]="initFilters.department"
              (onChange)="onInitDepartmentChange(); onFilterChange()"
              [filter]="true" filterBy="label"
              placeholder="All Departments"
              [style]="{'width':'100%'}"
              appendTo="body"
              [showClear]="true">
            </p-dropdown>
          </div>
          <div class="col-span-12 md:col-span-6">
            <label class="block mb-1 font-semibold text-slate-600 text-sm">Service Type</label>
            <p-dropdown
              [options]="initServiceTypeOptions"
              [(ngModel)]="initFilters.service_type"
              (onChange)="onFilterChange()"
              [filter]="true" filterBy="label"
              placeholder="All Service Types"
              [style]="{'width':'100%'}"
              appendTo="body"
              [showClear]="true">
            </p-dropdown>
          </div>

          <!-- Row 2: From Location Type + From Location -->
          <div class="col-span-12 md:col-span-2 lg:col-span-2">
            <label class="block mb-1 font-semibold text-slate-600 text-sm">From Type</label>
            <p-dropdown
              [options]="locationTypeOptions"
              [(ngModel)]="initFilters.from_location_type"
              (onChange)="onInitLocationTypeChange('from'); onFilterChange()"
              placeholder="Type"
              [showClear]="true"
              [style]="{'width':'100%'}"
              appendTo="body">
            </p-dropdown>
          </div>
          <div class="col-span-12 md:col-span-4 lg:col-span-4">
            <label class="block mb-1 font-semibold text-slate-600 text-sm">From Location</label>
            <p-dropdown
              [options]="initFromLocationOptions"
              [(ngModel)]="initFilters.from_location"
              (onChange)="onFilterChange()"
              [filter]="true" filterBy="label"
              placeholder="All From Locations"
              [style]="{'width':'100%'}"
              appendTo="body"
              [showClear]="true">
            </p-dropdown>
          </div>

          <!-- Row 2 cont: To Location Type + To Location -->
          <div class="col-span-12 md:col-span-2 lg:col-span-2">
            <label class="block mb-1 font-semibold text-slate-600 text-sm">To Type</label>
            <p-dropdown
              [options]="locationTypeOptions"
              [(ngModel)]="initFilters.to_location_type"
              (onChange)="onInitLocationTypeChange('to'); onFilterChange()"
              placeholder="Type"
              [showClear]="true"
              [style]="{'width':'100%'}"
              appendTo="body">
            </p-dropdown>
          </div>
          <div class="col-span-12 md:col-span-4 lg:col-span-4">
            <label class="block mb-1 font-semibold text-slate-600 text-sm">To Location</label>
            <p-dropdown
              [options]="initToLocationOptions"
              [(ngModel)]="initFilters.to_location"
              (onChange)="onFilterChange()"
              [filter]="true" filterBy="label"
              placeholder="All To Locations"
              [style]="{'width':'100%'}"
              appendTo="body"
              [showClear]="true">
            </p-dropdown>
          </div>

        </div>
      </div>

      <!-- Booking Results Grid -->
      <div class="mb-4">
        <p-table
          [value]="initBookings"
          [lazy]="true"
          (onLazyLoad)="loadInitBookings($event)"
          [totalRecords]="initTotalBookings"
          [paginator]="true"
          [rows]="10"
          [(first)]="initFirst"
          [showGridlines]="true"
          [scrollable]="true"
          scrollHeight="340px">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:3.5rem">Select</th>
              <th>Booking No</th>
              <th>Customer</th>
              <th>Department</th>
              <th>Service Type</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>Booking Date</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-booking>
            <tr [class.bg-blue-50]="selectedBookingForLink === booking" style="cursor:pointer" (click)="selectedBookingForLink = booking">
              <td class="text-center">
                <p-radioButton name="selectedBooking" [value]="booking" [(ngModel)]="selectedBookingForLink"></p-radioButton>
              </td>
              <td><strong>{{ booking.booking_no }}</strong></td>
              <td>{{ booking.company_name }}</td>
              <td>{{ booking.department }}</td>
              <td>{{ booking.service_type }}</td>
              <td>{{ locName(booking.from_location) }}</td>
              <td>{{ locName(booking.to_location) }}</td>
              <td>
                <span [ngClass]="getStatusClass(booking.status)">{{ booking.status }}</span>
              </td>
              <td>{{ booking.created_at | configDate }}</td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="text-center py-6 text-slate-400 italic">No bookings match the selected filters.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex justify-between items-center w-full">
          <div>
            <button pButton label="Clear Filters" icon="pi pi-filter-slash" class="p-button-outlined p-button-secondary p-button-sm" (click)="clearInitFilters()"></button>
          </div>
          <div class="flex gap-2">
            <button pButton label="Cancel" class="p-button-secondary p-button-outlined" (click)="showInitializationDialog = false"></button>
            <button pButton label="Continue" icon="pi pi-arrow-right" class="p-button-primary" (click)="continueInit()"></button>
          </div>
        </div>
      </ng-template>
    </p-dialog>

    <!-- CREATE/EDIT DIALOG -->
    <p-dialog [header]="isEditMode ? 'Edit Job Card - ' + currentJobCard.job_card_no : 'Create Job Card'" [(visible)]="showForm" [modal]="true" [draggable]="false" [resizable]="false" [style]="{ width: '98vw', height: '95vh' }" [contentStyle]="{ overflow: 'auto', height: '100%' }">
      <ng-template pTemplate="content">
        <div class="p-fluid form-grid dialog-body-padding">
          
          <!-- GENERAL SECTION -->
          <div class="section-header">General Details</div>
          
          <div class="mb-4 flex gap-2 flex-wrap items-center">
            <button pButton type="button" [label]="((currentJobCard.linked_bookings?.length || 0) > 0 || currentJobCard.booking_no) ? 'Append Booking' : 'Link Booking'" icon="pi pi-link" class="p-button-sm p-button-success" (click)="openBookingLinkDialog()"></button>
          </div>

          <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-3">
              <label class="block mb-1">Job Card No</label>
              <input pInputText [disabled]="isEditMode" [(ngModel)]="currentJobCard.job_card_no" placeholder="" [ngClass]="isEditMode ? 'bg-gray-100' : ''" />
            </div>

            <div class="col-span-3">
              <label class="block mb-1">Job Date <span class="text-red-500">*</span></label>
              <p-calendar [(ngModel)]="currentJobCard.job_date" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" [style]="{'width':'100%'}"></p-calendar>
            </div>

            <div class="col-span-3">
              <label class="block mb-1">Enquiry Type</label>
              <p-dropdown [options]="enquiryTypeOptions" [(ngModel)]="currentJobCard.enquiry_type" (onChange)="onCoreFieldChange('enquiry_type')" placeholder="Select Enquiry Type" appendTo="body"  [style]="{'width':'100%'}"></p-dropdown>
            </div>

            <div class="col-span-3">
              <label class="block mb-1">Company Name <span class="text-red-500">*</span></label>
              <p-dropdown [options]="companyOptions" [(ngModel)]="currentJobCard.company_name" [filter]="true" filterBy="label" placeholder="Select Company Name" appendTo="body"  [style]="{'width':'100%'}"></p-dropdown>
            </div>

            <div class="col-span-3">
              <label class="block mb-1">Sales Person</label>
              <p-dropdown [options]="salesPersonOptions" [(ngModel)]="currentJobCard.sales_person" [filter]="true" filterBy="label" placeholder="Select Sales Person" appendTo="body"  [style]="{'width':'100%'}"></p-dropdown>
            </div>

            <div class="col-span-3">
              <label class="block mb-1">Department <span class="text-red-500">*</span></label>
              <p-dropdown [options]="departmentOptions" [(ngModel)]="currentJobCard.department" (onChange)="onDepartmentChange(); onCoreFieldChange('department')" placeholder="Select Department" appendTo="body"  [style]="{'width':'100%'}"></p-dropdown>
            </div>

            <div class="col-span-3">
              <label class="block mb-1">Service Type <span class="text-red-500">*</span></label>
              <p-dropdown [options]="serviceTypeOptions" [(ngModel)]="currentJobCard.service_type" (onChange)="onCoreFieldChange('service_type')" placeholder="Select Service Type" appendTo="body"  [style]="{'width':'100%'}"></p-dropdown>
            </div>

            <div class="col-span-3">
              <label class="block mb-1">Job Month</label>
              <p-dropdown [options]="jobMonthOptions" [(ngModel)]="currentJobCard.job_month" placeholder="Select Job Month" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
            </div>

            <div class="col-span-6 flex gap-3">
              <div class="w-1/3">
                <label class="block mb-1">From Location Type</label>
                <p-dropdown [options]="locationTypeOptions" [(ngModel)]="currentJobCard.from_location_type" (onChange)="onLocationTypeChange('from'); onCoreFieldChange('from_location_type')" placeholder="Type" [showClear]="true" appendTo="body"  [style]="{'width':'100%'}"></p-dropdown>
              </div>
              <div class="w-2/3">
                <label class="block mb-1">From Location</label>
                <p-dropdown [options]="fromLocationOptions" [(ngModel)]="currentJobCard.from_location" (onChange)="onCoreFieldChange('from_location')" [filter]="true" filterBy="label" placeholder="Select From Location" appendTo="body"  [style]="{'width':'100%'}"></p-dropdown>
              </div>
            </div>

            <div class="col-span-6 flex gap-3">
              <div class="w-1/3">
                <label class="block mb-1">To Location Type</label>
                <p-dropdown [options]="locationTypeOptions" [(ngModel)]="currentJobCard.to_location_type" (onChange)="onLocationTypeChange('to'); onCoreFieldChange('to_location_type')" placeholder="Type" [showClear]="true" appendTo="body"  [style]="{'width':'100%'}"></p-dropdown>
              </div>
              <div class="w-2/3">
                <label class="block mb-1">To Location</label>
                <p-dropdown [options]="toLocationOptions" [(ngModel)]="currentJobCard.to_location" (onChange)="onCoreFieldChange('to_location')" [filter]="true" filterBy="label" placeholder="Select To Location" appendTo="body"  [style]="{'width':'100%'}"></p-dropdown>
              </div>
            </div>

            <div class="col-span-3">
              <label class="block mb-1">Status</label>
              <p-dropdown [options]="statusOptions" [(ngModel)]="currentJobCard.status" placeholder="Select Status" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
            </div>

            <div class="col-span-12">
              <label class="block mb-1">General Remarks</label>
              <textarea pInputTextarea [rows]="2" [(ngModel)]="currentJobCard.general_remarks" placeholder="Enter general remarks" [style]="{'width':'100%'}"></textarea>
            </div>
          </div>

          <!-- LINE ITEMS / SCOPE SECTION -->
          <div class="section-header">Line Items / Scope</div>
          <div class="mb-2">
            <button pButton label="+ Add Line Item" class="p-button-sm" (click)="addLineItemRow()"></button>
          </div>
          <p-table [value]="lineItemRows" [showGridlines]="true" class="mb-6">
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 80px;">S.No</th>
                <th>Type <span class="text-red-500">*</span></th>
                <th>Service Area <span class="text-red-500">*</span></th>
                <th>Vendor</th>
                <th>Vendor Booking No</th>
                <th>Basis <span class="text-red-500">*</span></th>
                <th style="width: 150px;">Qty <span class="text-red-500">*</span></th>
                <th style="width: 80px;">Action</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row let-i="rowIndex">
              <tr>
                <td>{{ i + 1 }}</td>
                <td>
                  <p-dropdown [options]="lineItemTypeOptions" [(ngModel)]="row.type" placeholder="Select Type" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                </td>
                <td>
                  <p-dropdown [options]="serviceAreaOptions" [(ngModel)]="row.service_area" placeholder="Select Area" [filter]="true" filterBy="label" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                </td>
                <td>
                  <p-dropdown [options]="vendorOptions" [(ngModel)]="row.vendor" placeholder="Select Vendor" [filter]="true" filterBy="label" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                </td>
                <td>
                  <input pInputText [(ngModel)]="row.vendor_booking_no" placeholder="Vendor Booking No" [style]="{'width':'100%'}" />
                </td>
                <td>
                  <p-dropdown [options]="basisOptions" [(ngModel)]="row.basis" placeholder="Select Basis" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                </td>
                <td>
                  <p-inputNumber [(ngModel)]="row.qty" [min]="0" placeholder="Quantity" [style]="{'width':'100%'}"></p-inputNumber>
                </td>
                <td>
                  <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeLineItemRow(i)"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>

          <!-- CARGO SECTION -->
          <div class="section-header">Cargo Details</div>
          <div class="mb-2">
            <button pButton label="+ Add Cargo" class="p-button-sm" (click)="addCargoRow()"></button>
          </div>
          <p-table [value]="cargoRows" [showGridlines]="true" class="mb-6">
            <ng-template pTemplate="header">
              <tr>
                <th>Cargo Type <span class="text-red-500">*</span></th>
                <th>Cargo Name</th>
                <th>HS Code</th>
                <th>Remarks</th>
                <th style="width: 80px;">Action</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row let-i="rowIndex">
              <tr>
                <td>
                  <p-dropdown [options]="cargoTypeOptions" [(ngModel)]="row.cargo_type" (onChange)="onCargoTypeChange(row)" placeholder="Select Cargo Type" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                </td>
                <td>
                  <p-dropdown [options]="row._descriptionOptions || []" [(ngModel)]="row.cargo_name" placeholder="Select Cargo Name" [filter]="true" filterBy="label" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                </td>
                <td>
                  <input pInputText [(ngModel)]="row.hs_code" placeholder="HS Code" [style]="{'width':'100%'}" />
                </td>
                <td>
                  <textarea pInputTextarea [rows]="1" [(ngModel)]="row.remarks" placeholder="Remarks" [style]="{'width':'100%'}"></textarea>
                </td>
                <td>
                  <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeCargoRow(i)"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>

          <!-- SCHEDULE SECTION -->
          <div class="section-header">Schedule</div>
          <div class="mb-2">
            <button pButton label="+ Add Schedule" class="p-button-sm" (click)="addScheduleRow()"></button>
          </div>
          <p-table [value]="scheduleRows" [showGridlines]="true" class="mb-6">
            <ng-template pTemplate="header">
              <tr>
                <th>From Location <span class="text-red-500">*</span></th>
                <th>To Location <span class="text-red-500">*</span></th>
                <th>Vessel / Airline</th>
                <th>Voyage / Flight No</th>
                <th>ETD</th>
                <th>ETA</th>
                <th style="width: 80px;">Action</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row let-i="rowIndex">
              <tr>
                <td>
                  <p-dropdown [options]="locationOptions" [(ngModel)]="row.from_location" placeholder="Select From" [filter]="true" filterBy="label" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                </td>
                <td>
                  <p-dropdown [options]="locationOptions" [(ngModel)]="row.to_location" placeholder="Select To" [filter]="true" filterBy="label" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                </td>
                <td>
                  <!-- Dynamically render vessel or airline options based on service_type -->
                  <p-dropdown *ngIf="isAirlineService()" [options]="airlineOptions" [(ngModel)]="row.vessel_airline" placeholder="Select Airline" [filter]="true" filterBy="label" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                  <p-dropdown *ngIf="isVesselService()" [options]="vesselOptions" [(ngModel)]="row.vessel_airline" placeholder="Select Vessel" [filter]="true" filterBy="label" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                  <input *ngIf="!isAirlineService() && !isVesselService()" pInputText [(ngModel)]="row.vessel_airline" placeholder="Vessel/Airline" [style]="{'width':'100%'}" />
                </td>
                <td>
                  <input pInputText [(ngModel)]="row.voyage_flight_no" placeholder="Voyage/Flight No" [style]="{'width':'100%'}" />
                </td>
                <td>
                  <p-calendar [(ngModel)]="row.etd" [showIcon]="true" [showTime]="true" hourFormat="24" appendTo="body" [style]="{'width':'100%'}"></p-calendar>
                </td>
                <td>
                  <p-calendar [(ngModel)]="row.eta" [showIcon]="true" [showTime]="true" hourFormat="24" appendTo="body" [style]="{'width':'100%'}"></p-calendar>
                </td>
                <td>
                  <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeScheduleRow(i)"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>

          <!-- BREAKUP SECTION -->
          <div class="section-header">Breakup Details</div>
          <div class="mb-2">
            <button pButton label="+ Add Breakup" class="p-button-sm" (click)="addBreakupRow()"></button>
          </div>
          <p-table [value]="breakupRows" [showGridlines]="true" class="mb-6">
            <ng-template pTemplate="header">
              <tr>
                <th>Source Booking</th>
                <th>Vendor Booking No</th>
                <th>Basis <span class="text-red-500">*</span></th>
                <th>Container No</th>
                <th>Pickup/Handover Date</th>
                <th>Pickup/Handover At</th>
                <th>Remarks</th>
                <th style="width: 80px;">Action</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row let-i="rowIndex">
              <tr>
                <td>
                  <p-tag [value]="row.booking_no || 'Manual'" [severity]="row.booking_no ? 'success' : 'info'"></p-tag>
                </td>
                <td>
                  <input pInputText [(ngModel)]="row.vendor_booking_no" placeholder="Vendor Booking No" [style]="{'width':'100%'}" />
                </td>
                <td>
                  <p-dropdown [options]="basisOptions" [(ngModel)]="row.basis" placeholder="Select Basis" appendTo="body" [style]="{'width':'100%'}"></p-dropdown>
                </td>
                <td>
                  <input pInputText [(ngModel)]="row.container_no" placeholder="Container No" [style]="{'width':'100%'}" />
                </td>
                <td>
                  <p-calendar [(ngModel)]="row.pickup_handover_date" [showIcon]="true" appendTo="body" [style]="{'width':'100%'}"></p-calendar>
                </td>
                <td>
                  <input pInputText [(ngModel)]="row.pickup_handover_at" placeholder="Pickup/Handover At" [style]="{'width':'100%'}" />
                </td>
                <td>
                  <textarea pInputTextarea [rows]="1" [(ngModel)]="row.remarks" placeholder="Remarks" [style]="{'width':'100%'}"></textarea>
                </td>
                <td>
                  <button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeBreakupRow(i)"></button>
                </td>
              </tr>
            </ng-template>
          </p-table>

          <!-- REMARKS SECTION -->
          <div class="section-header">Remarks</div>
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-12 md:col-span-4">
              <label class="block mb-1 text-slate-700">Customer Related Remarks</label>
              <textarea pInputTextarea [rows]="3" [(ngModel)]="currentJobCard.customer_remarks" placeholder="Customer related remarks"></textarea>
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="block mb-1 text-slate-700">Vendor Related Remarks</label>
              <textarea pInputTextarea [rows]="3" [(ngModel)]="currentJobCard.vendor_remarks" placeholder="Vendor related remarks"></textarea>
            </div>
            <div class="col-span-12 md:col-span-4">
              <label class="block mb-1 text-slate-700">Job Related Remarks</label>
              <textarea pInputTextarea [rows]="3" [(ngModel)]="currentJobCard.job_remarks" placeholder="Job related remarks"></textarea>
            </div>
          </div>

        </div>
      </ng-template>

      <ng-template pTemplate="footer">
        <button pButton label="Cancel" class="p-button-secondary p-button-outlined" (click)="showForm = false"></button>
        <button pButton label="Save" icon="pi pi-check" class="p-button-primary" (click)="saveJobCard()"></button>
      </ng-template>
    </p-dialog>

    <!-- BOOKING LINK DIALOG -->
    <p-dialog header="Link Booking" [(visible)]="showBookingLinkDialog" [modal]="true" [style]="{width: '80vw'}" appendTo="body">
      <div class="card p-2">
        <p-table #dtBookings [value]="linkBookings" [lazy]="true" (onLazyLoad)="loadLinkBookings($event)" [totalRecords]="totalBookings" [paginator]="true" [rows]="10" [showGridlines]="true">
          <ng-template pTemplate="caption">
            <div class="flex gap-2 justify-end">
              <span class="p-input-icon-left">
                <input pInputText type="text" (input)="dtBookings.filterGlobal($any($event.target).value, 'contains')" placeholder="Search Booking No, Customer..." />
              </span>
            </div>
          </ng-template>
          <ng-template pTemplate="header">
            <tr>
              <th>Booking No</th>
              <th>Customer</th>
              <th>Department</th>
              <th>Service Type</th>
              <th>From</th>
              <th>To</th>
              <th>Action</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-booking>
            <tr>
              <td>{{ booking.booking_no }}</td>
              <td>{{ booking.company_name }}</td>
              <td>{{ booking.department }}</td>
              <td>{{ booking.service_type }}</td>
              <td>{{ locName(booking.from_location) }}</td>
              <td>{{ locName(booking.to_location) }}</td>
              <td>
                <button pButton type="button" label="Select" icon="pi pi-link" class="p-button-sm" (click)="onBookingSelected(booking)"></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </p-dialog>

    <!-- BREAKUP ALLOCATION SELECTION DIALOG -->
    <p-dialog header="Select Breakup Allocations" [(visible)]="showAllocationSelectionDialog" [modal]="true" [style]="{width: '95vw', maxWidth: '95vw'}" [contentStyle]="{height: '70vh'}" appendTo="body">
      <div class="card p-2">
        <p-table [value]="allocationSelectionRows" [showGridlines]="true">
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 50px;">Select</th>
              <th>Type</th>
              <th>Container/Package No</th>
              <th>Vendor Booking No</th>
              <th>Basis</th>
              <th>Pickup Date</th>
              <th>Pickup At</th>
              <th>Remarks</th>
              <th>Owner / Status</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-row>
            <tr [ngClass]="{'bg-gray-50 opacity-70': row.disabled}">
              <td>
                <input type="checkbox" [(ngModel)]="row.selected" [disabled]="row.disabled" class="w-4 h-4 cursor-pointer" />
              </td>
              <td>
                <span class="font-bold" [ngClass]="{
                  'text-blue-600': row.breakup_type === 'container',
                  'text-purple-600': row.breakup_type === 'package',
                  'text-gray-600': row.breakup_type === 'general'
                }">{{ row.breakup_type | uppercase }}</span>
              </td>
              <td>{{ row.container_no }}</td>
              <td>{{ row.vendor_booking_no }}</td>
              <td>{{ row.basis }}</td>
              <td>{{ row.pickup_handover_date | configDate }}</td>
              <td>{{ row.pickup_handover_at }}</td>
              <td>{{ row.remarks }}</td>
              <td>
                <span *ngIf="row.status === 'Available'" class="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold border border-green-200">
                  Available
                </span>
                <span *ngIf="row.status === 'Allocated'" class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-bold border border-orange-200" [pTooltip]="'Allocated to ' + row.allocated_job_card_no" tooltipPosition="top">
                  Allocated to {{ row.allocated_job_card_no }}
                </span>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      <ng-template pTemplate="footer">
        <button pButton type="button" label="Cancel" class="p-button-secondary p-button-outlined" (click)="showAllocationSelectionDialog = false"></button>
        <button pButton type="button" label="Allocate & Link" icon="pi pi-check" class="p-button-success" (click)="confirmBreakupAllocation()"></button>
      </ng-template>
    </p-dialog>
  `
})
export class JobCardComponent implements OnInit, OnDestroy {
  jobCards: any[] = [];
  totalRecords = 0;
  showForm = false;
  isEditMode = false;
  currentJobCard: JobCardRecord = this.defaultJobCard();
  previousCoreFields: any = {};

  // Grids
  lineItemRows: any[] = [];
  cargoRows: any[] = [];
  scheduleRows: any[] = [];
  breakupRows: any[] = [];

  // Booking Link Variables
  showBookingLinkDialog = false;
  linkBookings: any[] = [];
  totalBookings = 0;
  isLoadingBookings = false;

  showAllocationSelectionDialog = false;
  allocationSelectionRows: any[] = [];
  tempBookingDetails: any = null;

  // Job Card Initialization Dialog state
  showInitializationDialog = false;
  initFilters = {
    department: '',
    service_type: '',
    from_location_type: '',
    from_location: '',
    to_location_type: '',
    to_location: ''
  };
  selectedBookingForLink: any = null;
  initBookings: any[] = [];
  initTotalBookings = 0;
  initFirst = 0;
  // Request sequence counter — prevents stale async responses from overwriting newer results
  private initLoadSeq = 0;
  initServiceTypeOptions: any[] = [];
  initFromLocationOptions: any[] = [];
  initToLocationOptions: any[] = [];

  // Options
  enquiryTypeOptions = [
    { label: 'Direct', value: 'Direct' },
    { label: 'Nominee', value: 'Nominee' }
  ];
  jobMonthOptions = [
    { label: 'January', value: 'January' },
    { label: 'February', value: 'February' },
    { label: 'March', value: 'March' },
    { label: 'April', value: 'April' },
    { label: 'May', value: 'May' },
    { label: 'June', value: 'June' },
    { label: 'July', value: 'July' },
    { label: 'August', value: 'August' },
    { label: 'September', value: 'September' },
    { label: 'October', value: 'October' },
    { label: 'November', value: 'November' },
    { label: 'December', value: 'December' }
  ];
  statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'Closed', value: 'Closed' },
    { label: 'Cancelled', value: 'Cancelled' }
  ];
  lineItemTypeOptions = [
    { label: 'Freight', value: 'Freight' },
    { label: 'Local', value: 'Local' },
    { label: 'Other', value: 'Other' }
  ];

  companyOptions: any[] = [];
  salesPersonOptions: any[] = [];
  departmentOptions: any[] = [];
  departmentOptionsRaw: any[] = [];
  serviceTypeOptions: any[] = [];
  serviceAreaOptions: any[] = [];
  locationTypeOptions: any[] = [];
  fromLocationOptions: any[] = [];
  toLocationOptions: any[] = [];
  locationOptions: any[] = [];
  vendorOptions: any[] = [];
  basisOptions: any[] = [];
  cargoTypeOptions: any[] = [];
  airlineOptions: any[] = [];
  vesselOptions: any[] = [];

  // Masters Raw Cache
  allLocations: any[] = [];
  locationMap: { [code: string]: string } = {};
  allServiceTypes: any[] = [];
  allCargoItems: any[] = [];
  allAirlines: any[] = [];
  allVessels: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private jobCardService: JobCardService,
    private contextService: ContextService,
    private masterCache: MasterCacheService,
    public configService: ConfigService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private bookingService: BookingService
  ) { }

  ngOnInit() {
    this.loadDropdownData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isLinked(): boolean {
    return !!this.currentJobCard.booking_no;
  }

  snapshotCoreFields() {
    this.previousCoreFields = {
      enquiry_type: this.currentJobCard.enquiry_type,
      department: this.currentJobCard.department,
      service_type: this.currentJobCard.service_type,
      from_location_type: this.currentJobCard.from_location_type,
      from_location: this.currentJobCard.from_location,
      to_location_type: this.currentJobCard.to_location_type,
      to_location: this.currentJobCard.to_location
    };
  }

  onCoreFieldChange(fieldName: string) {
    const hasBookings = this.currentJobCard.linked_bookings && this.currentJobCard.linked_bookings.length > 0;
    const hasBreakups = this.breakupRows && this.breakupRows.length > 0;
    
    if (hasBookings || hasBreakups) {
      this.confirmationService.confirm({
        message: 'Changing General Details will clear:\n• Linked Bookings\n• Selected Containers/Packages\n• Cargo Details\n• Schedule Details\n• Vendor Mapping\n\nContinue?',
        header: 'Warning: Operational Reset',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          // Release and Clear Grids
          this.currentJobCard.booking_no = '';
          this.currentJobCard.linked_bookings = [];
          this.breakupRows = [];
    this.allocationSelectionRows = [];
          this.cargoRows = [];
          this.lineItemRows = [];
          this.scheduleRows = [];
          // Update Snapshot to new value
          this.snapshotCoreFields();
        },
        reject: () => {
          // Revert to snapshot
          (this.currentJobCard as any)[fieldName] = this.previousCoreFields[fieldName];
        }
      });
    } else {
      this.snapshotCoreFields();
    }
  }

  resolveDropdownValue(value: string, options: any[], returnField: string = 'name'): string {
    if (!value || !options) return value || '';
    const found = options.find(o => (o.name || o.code || o.label || o.value || '').toString().trim().toLowerCase() === value.toString().trim().toLowerCase());
    if (found) {
      if (returnField === 'name' && found.name !== undefined) return found.name;
      if (returnField === 'code' && found.code !== undefined) return found.code;
      if (returnField === 'value' && found.value !== undefined) return found.value;
      if (returnField === 'label' && found.label !== undefined) return found.label;
      return found.name || found.code || found.value || found.label || value;
    }
    return value;
  }

  defaultJobCard(): JobCardRecord {
    return {
      job_date: new Date().toISOString().substring(0, 10),
      enquiry_type: 'Direct',
      status: 'Open',
      linked_bookings: []
    };
  }

  loadDropdownData() {
    combineLatest({
      vendors: this.masterCache.getVendors().pipe(take(1)),
      locations: this.masterCache.getLocations().pipe(take(1)),
      serviceTypes: this.masterCache.getServiceTypes().pipe(take(1)),
      depts: this.masterCache.getDepartments().pipe(take(1)),
      locationTypes: this.masterCache.getAllMasterTypes().pipe(take(1), map(types => types.filter(t => t.key === 'LOCATION'))),
      cargoMasterTypes: this.masterCache.getAllMasterTypes().pipe(take(1), map(types => types.filter(t => t.key === 'CARGO_TYPE'))),
      airlines: this.masterCache.getAirlines().pipe(take(1)),
      vessels: this.masterCache.getVessels().pipe(take(1)),
      basis: this.masterCache.getBasis().pipe(take(1)),
      customers: this.masterCache.getCustomers().pipe(take(1)),
      sales: this.masterCache.getSourceSales().pipe(take(1)),
      items: this.masterCache.getItems().pipe(take(1)),
      serviceAreas: this.masterCache.getServiceAreas().pipe(take(1))
    }).subscribe({
      next: (res) => {
        this.allLocations = res.locations || [];
        this.allLocations.forEach(loc => {
          this.locationMap[loc.code] = loc.name;
        });

        this.locationOptions = (res.locations || []).map(l => ({ label: l.name, value: l.code }));
        this.vendorOptions = (res.vendors || []).map(v => ({ label: v.name, value: v.name }));
        this.basisOptions = (res.basis || []).filter(b => (b.status || '').toString().toLowerCase() === 'active').map(b => ({ label: b.code, value: b.code }));
        
        this.companyOptions = (res.customers || []).map(c => ({ label: c.name, value: c.name }));
        this.salesPersonOptions = (res.sales || []).map(s => ({ label: s.name, value: s.name }));
        this.serviceAreaOptions = (res.serviceAreas || []).map(sa => ({ label: sa.service_area, value: sa.service_area }));

        this.departmentOptionsRaw = res.depts || [];
        this.departmentOptions = (res.depts || []).map(d => ({ label: d.name, value: d.name }));
        this.locationTypeOptions = (res.locationTypes || []).map(t => ({ label: t.value, value: t.value }));
        this.cargoTypeOptions = (res.cargoMasterTypes || []).filter(t => (t.status || '').toString().toLowerCase() === 'active').map(t => ({ label: t.value, value: t.value }));
        
        this.allServiceTypes = res.serviceTypes || [];
        this.allAirlines = (res.airlines || []).filter(a => a.active === true);
        this.airlineOptions = this.allAirlines.map(a => ({ label: a.airline_name, value: a.airline_name }));
        this.allVessels = (res.vessels || []).filter(v => v.active === true);
        this.vesselOptions = this.allVessels.map(v => ({ label: v.vessel_name, value: v.vessel_name }));

        this.allCargoItems = (res.items || []).filter(item => item.active === true || (item.status || '').toString().toLowerCase() === 'active');
      }
    });
  }

  loadJobCards(event: any) {
    const page = (event.first / event.rows) + 1;
    const limit = event.rows || 10;
    const search = event.globalFilter || '';
    const status = event.filters?.status?.value || '';

    this.jobCardService.getAll(page, limit, search, status).subscribe({
      next: (res) => {
        this.jobCards = res.data || [];
        this.totalRecords = res.total || 0;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load job cards' });
      }
    });
  }

  locName(code: any) {
    const key = (code || '').toString();
    return this.locationMap[key] || key;
  }

  resolveLocationType(locationCodeOrName: string): string {
    const code = this.resolveLocationCodeFromName(locationCodeOrName);
    const match = this.allLocations.find((l: any) => l.code === code);
    return match ? (match.type || '') : '';
  }

  resolveLocationCodeFromName(name: any): string {
    if (!name) return '';
    const norm = name.toString().trim().toLowerCase();
    
    // First try exact match on code
    let match = this.allLocations.find((l: any) => (l.code || '').toString().trim().toLowerCase() === norm);
    if (match) return match.code;
    
    // Then try match on name
    match = this.allLocations.find((l: any) => (l.name || '').toString().trim().toLowerCase() === norm);
    if (match) return match.code;
    
    return name;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold';
    }
  }

  openCreateDialog() {
    this.isEditMode = false;
    this.currentJobCard = this.defaultJobCard();
    this.snapshotCoreFields();
    this.lineItemRows = [];
    this.cargoRows = [];
    this.scheduleRows = [];
    this.breakupRows = [];
    
    this.fromLocationOptions = [];
    this.toLocationOptions = [];

    this.selectedBookingForLink = null;
    this.initFilters = {
      department: '',
      service_type: '',
      from_location_type: '',
      from_location: '',
      to_location_type: '',
      to_location: ''
    };
    this.initBookings = [];
    this.initTotalBookings = 0;
    this.initFirst = 0;
    this.initServiceTypeOptions = this.allServiceTypes.map(st => ({ label: st.name, value: st.name }));
    this.initFromLocationOptions = this.allLocations.map(l => ({ label: l.name, value: l.code }));
    this.initToLocationOptions = this.allLocations.map(l => ({ label: l.name, value: l.code }));

    this.showInitializationDialog = true;
    this.loadInitBookings({ first: 0, rows: 10 });
  }

  openEditDialog(jobCardNo: string) {
    this.isEditMode = true;
    this.jobCardService.getByNo(jobCardNo).subscribe({
      next: (res) => {
        this.currentJobCard = { ...res };
        // Parse dates for primeNG calendar
        if (this.currentJobCard.job_date) {
          this.currentJobCard.job_date = new Date(this.currentJobCard.job_date).toISOString().substring(0, 10);
        }

        this.lineItemRows = res.line_items || [];
        this.cargoRows = (res.cargo || []).map(cg => {
          cg._descriptionOptions = this.getCargoNamesByType(cg.cargo_type);
          return cg;
        });

        this.scheduleRows = (res.schedules || []).map(sc => {
          sc.etd = sc.etd ? new Date(sc.etd) : null;
          sc.eta = sc.eta ? new Date(sc.eta) : null;
          return sc;
        });

        this.breakupRows = (res.breakup || []).map(bk => {
          bk.pickup_handover_date = bk.pickup_handover_date ? new Date(bk.pickup_handover_date) : null;
          return bk;
        });

        this.onLocationTypeChange('from');
        this.onLocationTypeChange('to');

        this.showForm = true;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load job card details' });
      }
    });
  }

  onDepartmentChange() {
    const name = this.currentJobCard.department || '';
    const found = (this.departmentOptionsRaw || []).find(d => (d.name || '').toString().trim().toLowerCase() === name.toString().trim().toLowerCase());
    const deptCode = found ? found.code : '';

    if (deptCode) {
      this.serviceTypeOptions = this.allServiceTypes
        .filter(st => st.department_code === deptCode || !st.department_code)
        .map(st => ({ label: st.name, value: st.name }));
    } else {
      this.serviceTypeOptions = this.allServiceTypes.map(st => ({ label: st.name, value: st.name }));
    }
  }

  onLocationTypeChange(field: 'from' | 'to') {
    const type = field === 'from' ? this.currentJobCard.from_location_type : this.currentJobCard.to_location_type;
    let opts: any[] = [];
    if (!type) {
      opts = this.allLocations.map(l => ({ label: l.name, value: l.code }));
    } else {
      opts = this.allLocations
        .filter(l => (l.type || '').toString() === type)
        .map(l => ({ label: l.name, value: l.code }));
    }
    if (field === 'from') this.fromLocationOptions = opts;
    else this.toLocationOptions = opts;
  }

  // Initialization Dialog Handlers
  onInitDepartmentChange() {
    const name = this.initFilters.department || '';
    const found = (this.departmentOptionsRaw || []).find(d => (d.name || '').toString().trim().toLowerCase() === name.toString().trim().toLowerCase());
    const deptCode = found ? found.code : '';

    if (deptCode) {
      this.initServiceTypeOptions = this.allServiceTypes
        .filter(st => st.department_code === deptCode || !st.department_code)
        .map(st => ({ label: st.name, value: st.name }));
    } else {
      this.initServiceTypeOptions = this.allServiceTypes.map(st => ({ label: st.name, value: st.name }));
    }
    this.initFilters.service_type = '';
  }

  onInitLocationTypeChange(field: 'from' | 'to') {
    const type = field === 'from' ? this.initFilters.from_location_type : this.initFilters.to_location_type;
    let opts: any[] = [];
    if (!type) {
      opts = this.allLocations.map(l => ({ label: l.name, value: l.code }));
    } else {
      opts = this.allLocations
        .filter(l => (l.type || '').toString() === type)
        .map(l => ({ label: l.name, value: l.code }));
    }
    if (field === 'from') this.initFromLocationOptions = opts;
    else this.initToLocationOptions = opts;

    if (field === 'from') this.initFilters.from_location = '';
    else this.initFilters.to_location = '';
  }

  onFilterChange() {
    // Clear stale selection when filters change
    this.selectedBookingForLink = null;
    // Always reset to page 0 so the grid shows the first page of filtered results
    this.initFirst = 0;
    // Always call loadInitBookings directly — do NOT rely solely on initFirst
    // assignment to trigger PrimeNG's (onLazyLoad), because if initFirst was
    // already 0, Angular sees no value change and the event never fires.
    this.loadInitBookings({ first: 0, rows: 10 });
  }

  loadInitBookings(event: any) {
    const page = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    const limit = event.rows || 10;
    const search = event.globalFilter || '';

    // Snapshot filters at call time (prevents closure over stale values)
    const dept = (this.initFilters.department || '').trim();
    const st = (this.initFilters.service_type || '').trim();
    const fromL = (this.initFilters.from_location || '').trim();
    const toL = (this.initFilters.to_location || '').trim();

    // Increment sequence counter — any response with a lower seq is stale
    const mySeq = ++this.initLoadSeq;

    this.bookingService.getAll(page, limit, search, '', dept, st, fromL, toL).subscribe({
      next: (res) => {
        // Discard if a newer request has already been sent
        if (mySeq !== this.initLoadSeq) return;
        this.initBookings = res.data || [];
        this.initTotalBookings = res.total || 0;
      },
      error: () => {
        if (mySeq !== this.initLoadSeq) return;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bookings list' });
      }
    });
  }

  clearInitFilters() {
    this.initFilters = {
      department: '',
      service_type: '',
      from_location_type: '',
      from_location: '',
      to_location_type: '',
      to_location: ''
    };
    this.initServiceTypeOptions = this.allServiceTypes.map(st => ({ label: st.name, value: st.name }));
    this.initFromLocationOptions = this.allLocations.map(l => ({ label: l.name, value: l.code }));
    this.initToLocationOptions = this.allLocations.map(l => ({ label: l.name, value: l.code }));
    this.onFilterChange();
  }

  continueInit() {
    if (this.selectedBookingForLink) {
      this.bookingService.getByNo(this.selectedBookingForLink.booking_no).subscribe({
        next: (bookingDetails: any) => {
          this.showInitializationDialog = false;
          this.currentJobCard = this.defaultJobCard();
          this.lineItemRows = [];
          this.cargoRows = [];
          this.scheduleRows = [];
          this.breakupRows = [];
          this.verifyAndPrepareAllocation(bookingDetails);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch booking details' });
        }
      });
    } else {
      // Scenario B - No booking selected: create manual Job Card pre-filled with active filter values
      this.showInitializationDialog = false;
      this.isEditMode = false;
      this.currentJobCard = this.defaultJobCard();
      
      this.currentJobCard.department = this.initFilters.department || '';
      this.currentJobCard.service_type = this.initFilters.service_type || '';
      this.currentJobCard.from_location_type = this.initFilters.from_location_type || '';
      this.currentJobCard.from_location = this.initFilters.from_location || '';
      this.currentJobCard.to_location_type = this.initFilters.to_location_type || '';
      this.currentJobCard.to_location = this.initFilters.to_location || '';
      
      const jobDateVal = new Date().toISOString();
      try {
        const monthName = new Date(jobDateVal).toLocaleString('default', { month: 'long' });
        this.currentJobCard.job_month = monthName;
      } catch(e) {
        this.currentJobCard.job_month = '';
      }

      this.lineItemRows = [];
      this.cargoRows = [];
      this.scheduleRows = [];
      this.breakupRows = [];
      this.allocationSelectionRows = [];

      this.onLocationTypeChange('from');
      this.onLocationTypeChange('to');
      this.onDepartmentChange();

      this.showForm = true;
    }
  }

  // Grids Row Manipulation
  addLineItemRow() {
    this.lineItemRows.push({ s_no: this.lineItemRows.length + 1 });
    this.lineItemRows = [...this.lineItemRows];
  }

  removeLineItemRow(index: number) {
    this.lineItemRows.splice(index, 1);
    this.lineItemRows = [...this.lineItemRows];
  }

  addCargoRow() {
    this.cargoRows.push({});
    this.cargoRows = [...this.cargoRows];
  }

  removeCargoRow(index: number) {
    this.cargoRows.splice(index, 1);
    this.cargoRows = [...this.cargoRows];
  }

  addScheduleRow() {
    this.scheduleRows.push({});
    this.scheduleRows = [...this.scheduleRows];
  }

  removeScheduleRow(index: number) {
    this.scheduleRows.splice(index, 1);
    this.scheduleRows = [...this.scheduleRows];
  }

  addBreakupRow() {
    this.breakupRows.push({});
    this.breakupRows = [...this.breakupRows];
  }

  removeBreakupRow(index: number) {
    this.breakupRows.splice(index, 1);
    this.breakupRows = [...this.breakupRows];
  }

  onCargoTypeChange(row: any) {
    row._descriptionOptions = this.getCargoNamesByType(row.cargo_type);
    row.cargo_name = null;
    row.hs_code = null;
  }

  getCargoNamesByType(type: any) {
    const t = (type || '').toString();
    return (this.allCargoItems || [])
      .filter(ci => (ci.charge_type || ci.cargo_type || ci.item_type || '').toString() === t)
      .map(ci => ({ label: ci.name, value: ci.name }));
  }

  isAirlineService(): boolean {
    return (this.currentJobCard.service_type || '').toString().toLowerCase().includes('air');
  }

  isVesselService(): boolean {
    return (this.currentJobCard.service_type || '').toString().toLowerCase().includes('sea') || 
           (this.currentJobCard.service_type || '').toString().toLowerCase().includes('ocean');
  }

  // Booking Link Logics
  openBookingLinkDialog() {
    this.showBookingLinkDialog = true;
    this.loadLinkBookings({ first: 0, rows: 10 });
  }

  loadLinkBookings(event: any) {
    const page = (event.first / event.rows) + 1;
    const limit = event.rows || 10;
    const search = event.globalFilter || '';
    
    this.isLoadingBookings = true;
    this.bookingService.getAll(page, limit, search, '').subscribe({
      next: (res) => {
        this.linkBookings = res.data || [];
        this.totalBookings = res.total || 0;
        this.isLoadingBookings = false;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load bookings list' });
        this.isLoadingBookings = false;
      }
    });
  }

  onBookingSelected(bookingHeader: any) {
    this.showBookingLinkDialog = false;
    this.bookingService.getByNo(bookingHeader.booking_no).subscribe({
      next: (bookingDetails: any) => {
        this.verifyAndPrepareAllocation(bookingDetails);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch booking details' });
      }
    });
  }

  verifyAndPrepareAllocation(booking: any) {
    const normStr = (val: any) => (val || '').toString().trim().toLowerCase();
    const mismatch = (val1: any, val2: any) => {
      return val1 && normStr(val1) !== normStr(val2);
    };

    const errors: string[] = [];
    if (mismatch(this.currentJobCard.department, booking.department)) {
      errors.push(`Department (${this.currentJobCard.department} vs ${booking.department})`);
    }
    if (mismatch(this.currentJobCard.service_type, booking.service_type)) {
      errors.push(`Service Type (${this.currentJobCard.service_type} vs ${booking.service_type})`);
    }
    if (mismatch(this.currentJobCard.from_location_type, booking.from_location_type)) {
      errors.push(`From Location Type (${this.currentJobCard.from_location_type} vs ${booking.from_location_type})`);
    }
    if (mismatch(this.currentJobCard.from_location, booking.from_location)) {
      errors.push(`From Location (${this.locName(this.currentJobCard.from_location)} vs ${this.locName(booking.from_location)})`);
    }
    if (mismatch(this.currentJobCard.to_location_type, booking.to_location_type)) {
      errors.push(`To Location Type (${this.currentJobCard.to_location_type} vs ${booking.to_location_type})`);
    }
    if (mismatch(this.currentJobCard.to_location, booking.to_location)) {
      errors.push(`To Location (${this.locName(this.currentJobCard.to_location)} vs ${this.locName(booking.to_location)})`);
    }

    if (errors.length > 0) {
      this.confirmationService.confirm({
        message: 'The selected booking has operational mismatches:\n' + errors.join('\n') + '\n\nAre you sure you want to append it anyway?',
        header: 'Operational Mismatch Warning',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.proceedWithAllocation(booking);
        }
      });
      return;
    }
    this.proceedWithAllocation(booking);
  }

  proceedWithAllocation(booking: any) {
    this.jobCardService.getAllocationsByBooking(booking.id).subscribe({
      next: (allocations: any[]) => {
        this.tempBookingDetails = booking;
        this.buildAllocationSelectionRows(booking, allocations);
        this.showAllocationSelectionDialog = true;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch allocations' });
      }
    });
  }

  buildAllocationSelectionRows(booking: any, allocations: any[]) {
    const selectionRows: any[] = [];
    (booking.booking_breakup || []).forEach((bk: any) => {
      const baseRef = bk.booking_ref_no || bk.vendor_booking_no || '';
      const baseBasis = bk.basis || '';
      const baseRemarks = bk.remarks || '';
      
      if (bk.container_breakup && bk.container_breakup.length > 0) {
        bk.container_breakup.forEach((cb: any) => {
          const isAllocated = allocations.find(a => 
            (Number(a.booking_breakup_id) === Number(cb.id) && a.breakup_type === 'container') ||
            (a.breakup_type === 'container' && a.item_no && cb.container_no && a.item_no.trim().toLowerCase() === cb.container_no.trim().toLowerCase())
          );
          selectionRows.push({
            booking_breakup_id: cb.id,
            breakup_type: 'container',
            container_no: cb.container_no || '',
            vendor_booking_no: cb.booking_ref_no || baseRef,
            basis: cb.basis || baseBasis,
            pickup_handover_date: cb.pickup_handover_date ? new Date(cb.pickup_handover_date) : null,
            pickup_handover_at: cb.empty_yard || cb.pickup_handover_at || '',
            remarks: cb.remarks || baseRemarks,
            allocated_job_card_no: isAllocated ? isAllocated.job_card_no : '',
            allocated_job_card_id: isAllocated ? isAllocated.job_card_id : null,
            selected: isAllocated && isAllocated.job_card_id === this.currentJobCard.id ? true : false,
            disabled: isAllocated && isAllocated.job_card_id !== this.currentJobCard.id ? true : false,
            status: isAllocated ? 'Allocated' : 'Available',
            breakup_no: bk.breakup_no
          });
        });
      } else if (bk.package_breakup && bk.package_breakup.length > 0) {
        bk.package_breakup.forEach((pb: any) => {
          const isAllocated = allocations.find(a => 
            (Number(a.booking_breakup_id) === Number(pb.id) && a.breakup_type === 'package') ||
            (a.breakup_type === 'package' && a.item_no && pb.package_no && a.item_no.trim().toLowerCase() === pb.package_no.trim().toLowerCase())
          );
          selectionRows.push({
            booking_breakup_id: pb.id,
            breakup_type: 'package',
            container_no: pb.package_no || '',
            vendor_booking_no: pb.booking_ref_no || baseRef,
            basis: pb.basis || baseBasis,
            pickup_handover_date: pb.handover_date ? new Date(pb.handover_date) : null,
            pickup_handover_at: pb.carting || pb.pickup_handover_at || '',
            remarks: pb.remarks || baseRemarks,
            allocated_job_card_no: isAllocated ? isAllocated.job_card_no : '',
            allocated_job_card_id: isAllocated ? isAllocated.job_card_id : null,
            selected: isAllocated && isAllocated.job_card_id === this.currentJobCard.id ? true : false,
            disabled: isAllocated && isAllocated.job_card_id !== this.currentJobCard.id ? true : false,
            status: isAllocated ? 'Allocated' : 'Available',
            breakup_no: bk.breakup_no
          });
        });
      } else {
        const isAllocated = allocations.find(a => 
          (Number(a.booking_breakup_id) === Number(bk.id) && a.breakup_type === 'general') ||
          (a.breakup_type === 'general' && a.item_no && bk.breakup_no && a.item_no.toString().trim() === bk.breakup_no.toString().trim())
        );
        selectionRows.push({
          booking_breakup_id: bk.id,
          breakup_type: 'general',
          container_no: '',
          vendor_booking_no: baseRef,
          basis: baseBasis,
          pickup_handover_date: bk.valid_till ? new Date(bk.valid_till) : null,
          pickup_handover_at: '',
          remarks: baseRemarks,
          allocated_job_card_no: isAllocated ? isAllocated.job_card_no : '',
          allocated_job_card_id: isAllocated ? isAllocated.job_card_id : null,
          selected: isAllocated && isAllocated.job_card_id === this.currentJobCard.id ? true : false,
          disabled: isAllocated && isAllocated.job_card_id !== this.currentJobCard.id ? true : false,
          status: isAllocated ? 'Allocated' : 'Available',
          breakup_no: bk.breakup_no
        });
      }
    });
    this.allocationSelectionRows = selectionRows;
  }

  confirmBreakupAllocation() {
    this.showAllocationSelectionDialog = false;
    
    const hasData = this.lineItemRows.length > 0 || 
                    this.cargoRows.length > 0 || 
                    this.scheduleRows.length > 0 || 
                    this.breakupRows.length > 0 ||
                    this.currentJobCard.customer_remarks || 
                    this.currentJobCard.vendor_remarks || 
                    this.currentJobCard.job_remarks ||
                    this.currentJobCard.general_remarks;

    this.executeBookingLink(this.tempBookingDetails);
  }

  bookingToJobAdapter(booking: any, options: any) {
    const header = {
      booking_id: booking.id,
      booking_no: booking.booking_no,
      department: this.resolveDropdownValue(booking.department, options.departmentOptionsRaw, 'name') || booking.department,
      service_type: this.resolveDropdownValue(booking.service_type, options.allServiceTypes, 'name') || booking.service_type,
      company_name: booking.company_name,
      enquiry_type: booking.enquiry_type || 'Direct',
      sales_person: this.resolveDropdownValue(booking.source_sales_person || booking.sales_person, options.salesPersonOptions, 'value') || booking.source_sales_person || booking.sales_person,
      from_location_type: booking.from_location_type || this.resolveLocationType(booking.from_location),
      from_location: this.resolveLocationCodeFromName(booking.from_location),
      to_location_type: booking.to_location_type || this.resolveLocationType(booking.to_location),
      to_location: this.resolveLocationCodeFromName(booking.to_location),
      general_remarks: booking.remarks || '',
      job_month: ''
    };
    const jobDateVal = booking.effective_date_from || booking.created_at || new Date().toISOString();
    try {
      header.job_month = new Date(jobDateVal).toLocaleString('default', { month: 'long' });
    } catch(e) {}

    const lineItems = (booking.line_items || []).map((li: any) => ({
      type: '',
      service_area: this.resolveDropdownValue(li.service_area, options.serviceAreaOptions, 'value') || li.service_area || '',
      vendor: '',
      vendor_booking_no: li.vendor_booking_no || '',
      basis: this.resolveDropdownValue(li.basis, options.basisOptions, 'value') || li.basis || '',
      qty: li.qty ?? li.quantity ?? 1
    }));

    const cargo = (booking.cargo || []).map((cg: any) => ({
      cargo_type: this.resolveDropdownValue(cg.cargo_type, options.cargoTypeOptions, 'value') || cg.cargo_type || '',
      cargo_name: cg.description || cg.cargo_name || '',
      hs_code: cg.hs_code || '',
      remarks: cg.remarks || '',
      qty: cg.qty || cg.quantity || 1,
      weight: cg.weight || 0,
      volume: cg.volume || 0,
      _descriptionOptions: this.getCargoNamesByType(cg.cargo_type || '')
    }));

    const schedules = (booking.schedules || []).map((sc: any) => ({
      from_location: sc.from_location || sc.location || '',
      to_location: sc.to_location || '',
      vessel_airline: sc.vessel_airline || '',
      voyage_flight_no: sc.voyage_flight_no || '',
      etd: sc.etd || sc.schedule_date ? new Date(sc.etd || sc.schedule_date) : null,
      eta: sc.eta ? new Date(sc.eta) : null
    }));

    const breakups = options.allocationSelectionRows
      .filter((row: any) => row.selected && !row.disabled)
      .map((row: any) => ({
        booking_id: booking.id,
        booking_no: booking.booking_no,
        booking_breakup_id: row.booking_breakup_id,
        breakup_type: row.breakup_type,
        vendor_booking_no: row.vendor_booking_no,
        basis: row.basis,
        container_no: row.container_no,
        pickup_handover_date: row.pickup_handover_date,
        pickup_handover_at: row.pickup_handover_at,
        remarks: row.remarks,
        breakup_no: row.breakup_no
      }));

    return { header, lineItems, cargo, schedules, breakups };
  }

  executeBookingLink(booking: any) {
    console.log('BOOKING PAYLOAD', booking);
    const options = {
      departmentOptionsRaw: this.departmentOptionsRaw,
      allServiceTypes: this.allServiceTypes,
      salesPersonOptions: this.salesPersonOptions,
      serviceAreaOptions: this.serviceAreaOptions,
      basisOptions: this.basisOptions,
      cargoTypeOptions: this.cargoTypeOptions,
      allocationSelectionRows: this.allocationSelectionRows
    };

    const adapted = this.bookingToJobAdapter(booking, options);

    // Merge Header
    if (!this.currentJobCard.booking_no) {
      this.currentJobCard.booking_id = adapted.header.booking_id;
      this.currentJobCard.booking_no = adapted.header.booking_no;
      this.currentJobCard.department = adapted.header.department;
      this.currentJobCard.service_type = adapted.header.service_type;
      this.currentJobCard.company_name = adapted.header.company_name;
      this.currentJobCard.enquiry_type = adapted.header.enquiry_type;
      this.currentJobCard.sales_person = adapted.header.sales_person;
      this.currentJobCard.from_location_type = adapted.header.from_location_type;
      this.currentJobCard.from_location = adapted.header.from_location;
      this.currentJobCard.to_location_type = adapted.header.to_location_type;
      this.currentJobCard.to_location = adapted.header.to_location;
      this.currentJobCard.general_remarks = adapted.header.general_remarks;
      this.currentJobCard.job_month = adapted.header.job_month;
      
      this.onLocationTypeChange('from');
      this.onLocationTypeChange('to');
      this.onDepartmentChange();
    } else {
      if (!this.currentJobCard.linked_bookings) this.currentJobCard.linked_bookings = [];
      const alreadyLinked = this.currentJobCard.booking_no === booking.booking_no || this.currentJobCard.linked_bookings.some((lb: any) => lb.booking_no === booking.booking_no);
      if (!alreadyLinked) {
        this.currentJobCard.linked_bookings.push({ booking_id: booking.id, booking_no: booking.booking_no });
      }
    }

    // Merge Line Items
    const safeNewLineItems = adapted.lineItems.filter((nli: any) => {
      return !this.lineItemRows.some(eli => 
        eli.type === nli.type && 
        eli.service_area === nli.service_area && 
        eli.basis === nli.basis && 
        (eli.vendor_booking_no === nli.vendor_booking_no)
      );
    });
    const mergedLineItems = [...this.lineItemRows, ...safeNewLineItems];
    mergedLineItems.forEach((li, idx) => { li.s_no = idx + 1; });
    this.lineItemRows = mergedLineItems;

    // Merge Cargo
    this.cargoRows = [...this.cargoRows, ...adapted.cargo];

    // Merge Schedules
    this.scheduleRows = [...this.scheduleRows, ...adapted.schedules];

    // Merge Breakups
    const safeNewBreakups = adapted.breakups.filter((nb: any) => {
      return !this.breakupRows.some(eb => 
        (eb.booking_breakup_id && eb.booking_breakup_id === nb.booking_breakup_id && eb.breakup_type === nb.breakup_type) ||
        (eb.container_no && nb.container_no && eb.container_no.toLowerCase() === nb.container_no.toLowerCase()) ||
        (eb.breakup_no && nb.breakup_no && eb.breakup_no.toLowerCase() === nb.breakup_no.toLowerCase())
      );
    });
    this.breakupRows = [...this.breakupRows, ...safeNewBreakups];

    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Booking linked successfully' });
    this.showForm = true;
  }

  removeSpecificBookingLink(index: number, bookingId: number, bookingNo: string) {
    const activeBreakups = this.breakupRows.filter(r => r.booking_id === bookingId || r.booking_no === bookingNo);
    
    if (activeBreakups.length > 0) {
      this.confirmationService.confirm({
        message: `Booking ${bookingNo} still has ${activeBreakups.length} active breakup allocations in this Job. Removing the booking will release these allocations. Continue?`,
        header: 'Active Allocations Warning',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.executeRemoveBooking(index, bookingId, bookingNo);
        }
      });
    } else {
      this.executeRemoveBooking(index, bookingId, bookingNo);
    }
  }

  executeRemoveBooking(index: number, bookingId: number, bookingNo: string) {
    this.currentJobCard.linked_bookings?.splice(index, 1);
    // Remove purely source-linked breakups
    this.breakupRows = this.breakupRows.filter(r => !(r.booking_id === bookingId || r.booking_no === bookingNo));
    
    this.messageService.add({ severity: 'info', summary: 'Unlinked', detail: `Booking ${bookingNo} unlinked successfully.` });
  }

  clearBookingLink() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to clear the Booking link? The Job Card will become a manual Job Card.',
      header: 'Clear Booking Link',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.currentJobCard.booking_id = undefined;
        this.currentJobCard.booking_no = undefined;
        this.breakupRows.forEach(row => {
          row.booking_breakup_id = undefined;
          row.breakup_type = undefined;
        });
        this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Booking linkage cleared' });
      }
    });
  }

  saveJobCard() {
    // Basic validation
    if (!this.currentJobCard.job_date) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Job Date is required' });
      return;
    }
    if (!this.currentJobCard.company_name) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Company Name is required' });
      return;
    }
    if (!this.currentJobCard.department) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Department is required' });
      return;
    }
    if (!this.currentJobCard.service_type) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Service Type is required' });
      return;
    }

    // Grid validation
    for (let i = 0; i < this.lineItemRows.length; i++) {
      const li = this.lineItemRows[i];
      if (!li.type || !li.service_area || !li.basis || li.qty === undefined || li.qty === null) {
        this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: `Line Item row ${i+1} is missing type, service area, basis or qty` });
        return;
      }
    }

    for (let i = 0; i < this.cargoRows.length; i++) {
      const cg = this.cargoRows[i];
      if (!cg.cargo_type) {
        this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: `Cargo row ${i+1} is missing cargo type` });
        return;
      }
    }

    for (let i = 0; i < this.scheduleRows.length; i++) {
      const sc = this.scheduleRows[i];
      if (!sc.from_location || !sc.to_location) {
        this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: `Schedule row ${i+1} is missing from or to location` });
        return;
      }
    }

    for (let i = 0; i < this.breakupRows.length; i++) {
      const bk = this.breakupRows[i];
      if (!bk.basis) {
        this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: `Breakup row ${i+1} is missing basis` });
        return;
      }
    }

    const payload: JobCardRecord = {
      ...this.currentJobCard,
      line_items: this.lineItemRows,
      cargo: this.cargoRows,
      schedules: this.scheduleRows,
      breakup: this.breakupRows
    };

    if (this.isEditMode) {
      this.jobCardService.update(this.currentJobCard.id!, payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Job Card updated successfully' });
          this.showForm = false;
          this.loadJobCards({ first: 0, rows: this.configService.getSystemConfig().maxRecordsPerPage });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.details || 'Failed to update job card' });
        }
      });
    } else {
      this.jobCardService.create(payload).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Job Card created successfully' });
          this.showForm = false;
          this.loadJobCards({ first: 0, rows: this.configService.getSystemConfig().maxRecordsPerPage });
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Failed to create job card' });
        }
      });
    }
  }

  reopenJobCard(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to reopen this Job Card?',
      header: 'Reopen Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.jobCardService.updateStatus(id, 'Open').subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Job Card reopened' });
            this.loadJobCards({ first: 0, rows: this.configService.getSystemConfig().maxRecordsPerPage });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reopen job card' });
          }
        });
      }
    });
  }

  deleteJobCard(id: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete/disable this Job Card?',
      header: 'Delete Confirmation',
      icon: 'pi pi-trash',
      accept: () => {
        this.jobCardService.delete(id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Job Card disabled successfully' });
            this.loadJobCards({ first: 0, rows: this.configService.getSystemConfig().maxRecordsPerPage });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete job card' });
          }
        });
      }
    });
  }
}
