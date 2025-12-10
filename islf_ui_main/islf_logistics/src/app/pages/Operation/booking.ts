import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { BookingService, BookingRecord } from '../../services/booking.service';
import { EnquiryService } from '../../services/enquiry.service';
import { ServiceTypeService } from '../../services/servicetype.service';
import { ContextService } from '../../services/context.service';
import { MasterLocationService } from '../../services/master-location.service';
import { MasterLocationComponent } from '../../pages/masters/masterlocation';
import { MasterTypeService } from '../../services/mastertype.service';
import { MasterItemService, MasterItem } from '../../services/master-item.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ToastModule,
    TableModule,
    CalendarModule,
    MasterLocationComponent,
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Booking Dashboard</div>
      <p-table #dt [value]="bookings" [paginator]="true" [rows]="10" dataKey="booking_no" [showGridlines]="true" [globalFilterFields]="['booking_no','customer_name','company_name','department','service_type','from_location','to_location','status']">
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <div class="flex gap-2">
              <button pButton label="Create Booking" icon="pi pi-plus" (click)="openCreateDialog()"></button>
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
            <th>
              <div class="flex justify-between items-center">Booking No
                <p-columnFilter field="booking_no" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">Customer
                <p-columnFilter field="customer_name" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">Department
                <p-columnFilter field="department" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">Service Type
                <p-columnFilter field="service_type" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">From
                <p-columnFilter field="from_location" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">To
                <p-columnFilter field="to_location" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">Status
                <p-columnFilter field="status" matchMode="equals" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">Date
                <p-columnFilter field="created_at" matchMode="contains" display="menu"></p-columnFilter>
              </div>
            </th>
            <th>Action</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.booking_no }}</td>
            <td>{{ row.customer_name }}</td>
            <td>{{ row.department }}</td>
            <td>{{ row.service_type }}</td>
            <td>{{ locName(row.from_location) }}</td>
            <td>{{ locName(row.to_location) }}</td>
            <td>{{ row.status }}</td>
            <td>{{ row.created_at | date:'dd/MM/yyyy' }}</td>
            <td>
              <button pButton label="Open" icon="pi pi-external-link" class="p-button-sm" (click)="openBooking(row.booking_no)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog header="Create Booking" [(visible)]="showCreateDialog" [modal]="true" [style]="{width: '95vw', maxWidth: '95vw'}" [contentStyle]="{height: '70vh'}">
      <div class="grid grid-cols-12 gap-3">
        <div class="col-span-6">
          <label class="block mb-1">Department</label>
          <p-dropdown [options]="departmentOptions" [(ngModel)]="dialog.department" (ngModelChange)="onDepartmentChange()" [filter]="true" filterBy="label" placeholder="Select Department"></p-dropdown>
        </div>
        <div class="col-span-6">
          <label class="block mb-1">Service Type</label>
          <p-dropdown [options]="serviceTypeOptions" [(ngModel)]="dialog.service_type" [filter]="true" filterBy="label" placeholder="Select Service Type"></p-dropdown>
        </div>
        <div class="col-span-6">
          <label class="block mb-1">From Location</label>
          <p-dropdown [options]="fromLocationOptions" [(ngModel)]="dialog.from_location" [filter]="true" filterBy="label" placeholder="Select From"></p-dropdown>
        </div>
        <div class="col-span-6">
          <label class="block mb-1">To Location</label>
          <p-dropdown [options]="toLocationOptions" [(ngModel)]="dialog.to_location" [filter]="true" filterBy="label" placeholder="Select To"></p-dropdown>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <button pButton label="Search Enquiries" icon="pi pi-search" (click)="searchEnquiries()"></button>
      </div>

      <div class="mt-3" *ngIf="matchingEnquiries.length">
        <p-table [value]="matchingEnquiries" selectionMode="multiple" [(selection)]="selectedEnquiries" dataKey="code" [showGridlines]="true">
          <ng-template pTemplate="header">
            <tr>
              <th style="width:3rem"></th>
              <th>Code</th>
              <th>Customer</th>
              <th>Department</th>
              <th>Service Type</th>
              <th>From</th>
              <th>To</th>
              <th>Dates</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-enq>
            <tr [pSelectableRow]="enq">
              <td>
                <p-tableCheckbox [value]="enq"></p-tableCheckbox>
              </td>
              <td>{{ enq.code }}</td>
              <td>{{ enq.customer_name }}</td>
              <td>{{ enq.department }}</td>
              <td>{{ enq.service_type }}</td>
              <td>{{ enq.from_location }}</td>
              <td>{{ enq.to_location }}</td>
              <td>{{ enq.effective_date_from }} → {{ enq.effective_date_to }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <ng-template pTemplate="footer">
        <button pButton label="Save" icon="pi pi-check" (click)="saveFromEnquiries()"></button>
        <button pButton label="Cancel" class="p-button-secondary" (click)="showCreateDialog=false"></button>
      </ng-template>
    </p-dialog>

    <p-dialog header="Add Booking" [(visible)]="showBookingForm" [modal]="true" [draggable]="false" [resizable]="false" [closeOnEscape]="true" [style]="{ width: '95vw', maxWidth: '1700px', height: '90vh' }" [contentStyle]="{ overflow: 'auto', maxHeight: '75vh' }">
      <ng-template pTemplate="content">
      <div class="p-fluid form-grid dialog-body-padding">
      <div class="section-header">General Booking Details</div>
      <div class="grid grid-cols-12 gap-4 mb-6">
        <div class="col-span-3">
          <label class="block mb-1">Booking No</label>
          <input pInputText class="bg-yellow-50" [readonly]="true" [(ngModel)]="currentBooking.booking_no"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Enquiry Type</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.booking_type"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Company Name</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.company_name"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Source / Sales Person</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.source_sales_person"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Department</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.department"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Service Type</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.service_type"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">From Location</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.from_location"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">To Location</label>
          <input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="currentBooking.to_location"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Effective Date From</label>
          <p-calendar [(ngModel)]="currentBooking.effective_date_from" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" [disabled]="isFrozen" class="w-80" [inputStyle]="{ width: '220px' }"></p-calendar>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Effective Date To</label>
          <p-calendar [(ngModel)]="currentBooking.effective_date_to" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" [disabled]="isFrozen" class="w-80" [inputStyle]="{ width: '220px' }"></p-calendar>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Status</label>
          <p-dropdown [(ngModel)]="currentBooking.status" [options]="bookingStatusOptions" optionLabel="label" optionValue="value" placeholder="Select Status" class="w-full"></p-dropdown>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Remarks</label>
          <input pInputText class="bg-orange-50" [(ngModel)]="currentBooking.remarks"/>
        </div>
        <div class="col-span-3">
          <label class="block mb-1">Date</label>
          <p-calendar [(ngModel)]="currentBooking.created_at" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" [disabled]="isFrozen" class="w-80" [inputStyle]="{ width: '220px' }"></p-calendar>
        </div>
      </div>

      <div class="section-header">Carriage List</div>
      <div class="mb-2">
        <button pButton label="+ Add Cargo" class="p-button-sm" (click)="addCargoRow()"></button>
      </div>
      <p-table [value]="cargoRows" [showGridlines]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>Cargo Type</th>
            <th>Cargo Name</th>
            <th>HS Code</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-cg let-i="rowIndex">
          <tr>
            <td>
              <p-dropdown [(ngModel)]="cg.cargo_type" [options]="cargoTypeOptions" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" (onChange)="onCargoTypeChange(cg)"></p-dropdown>
            </td>
            <td>
              <p-dropdown [(ngModel)]="cg.description" [options]="getCargoNamesByType(cg.cargo_type)" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" (onChange)="onCargoNameChange(cg)"></p-dropdown>
            </td>
            <td>
              <p-dropdown [(ngModel)]="cg.hs_code" [options]="getHsCodesByTypeAndName(cg.cargo_type, cg.description)" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body"></p-dropdown>
            </td>
            <td><button pButton icon="pi pi-trash" class="p-button-danger p-button-sm" (click)="removeCargoRow(i)"></button></td>
          </tr>
        </ng-template>
      </p-table>

      <div class="section-header">Carriage List</div>
      <p-table [value]="carriageRows" [showGridlines]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>Carriage</th>
            <th>Location Type</th>
            <th>Location</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-cr>
          <tr>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="cr.carriage"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="cr.location_type"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="cr.location"/></td>
          </tr>
        </ng-template>
      </p-table>

      <div class="section-header">Line Items (Booking Details)</div>
      <p-table [value]="lineItemsRows" [showGridlines]="true">
        <ng-template pTemplate="header">
          <tr>
            <th>Type</th>
            <th>Service Area</th>
            <th>Basis</th>
            <th>From</th>
            <th>To</th>
            <th>Sourced Vendor</th>
            <th>Basis Qty</th>
            <th>Booking Ref</th>
            <th>Valid Till</th>
            <th>Status</th>
            <th>Remarks</th>
            <th>Schedule</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-li>
          <tr>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.type"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.service_area"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.basis"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.from_location"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.to_location"/></td>
            <td><input pInputText class="bg-yellow-50" [readonly]="isFrozen" [(ngModel)]="li.sourced_vendor"/></td>
            <td><input pInputText class="bg-orange-50" [(ngModel)]="li.basis_qty"/></td>
            <td><input pInputText class="bg-orange-50" [(ngModel)]="li.booking_ref"/></td>
            <td>
              <p-calendar [(ngModel)]="li.valid_till" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" class="w-96" [inputStyle]="{ width: '260px' }" [style]="{ width: '260px' }"></p-calendar>
            </td>
            <td>
              <p-dropdown [(ngModel)]="li.status" [options]="bookingStatusOptions" optionLabel="label" optionValue="value" class="w-full"></p-dropdown>
            </td>
            <td><input pInputText class="bg-orange-50" [(ngModel)]="li.remarks"/></td>
            <td>
              <p-dropdown [options]="yesNoOptions" [(ngModel)]="li.schedule" (onChange)="onLineItemScheduleChange(li)"></p-dropdown>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <div class="section-header">Schedule</div>
      <div *ngFor="let svc of scheduleServiceKeys()" class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <div class="font-semibold">{{ svc }}</div>
          <button pButton label="+ Add Transit" class="p-button-sm" (click)="addTransit(svc)"></button>
        </div>
        <p-table [value]="scheduleGroups[svc]" [showGridlines]="true">
          <ng-template pTemplate="header">
            <tr>
              <th>Transit Count</th>
              <th>From Location Type</th>
              <th>From Location</th>
              <th>To Location Type</th>
              <th>To Location</th>
              <th>Vessel / Airline</th>
              <th>Voyage / Flight No</th>
              <th>ETD</th>
              <th>ETA</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-trn let_i="rowIndex">
            <tr>
              <td>{{ iToOneBased(trn.transit_count) }}</td>
              <td>
                <div class="flex gap-2 items-center">
                  <p-dropdown [(ngModel)]="trn.from_location_type" [options]="locationTypeOptions" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-40"></p-dropdown>
                  <button pButton icon="pi pi-ellipsis-h" class="p-button-sm" (click)="openMasterLocation()"></button>
                </div>
              </td>
              <td>
                <p-dropdown [(ngModel)]="trn.from_location" [options]="getLocationsByType(trn.from_location_type)" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-64"></p-dropdown>
              </td>
              <td>
                <div class="flex gap-2 items-center">
                  <p-dropdown [(ngModel)]="trn.to_location_type" [options]="locationTypeOptions" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-40"></p-dropdown>
                  <button pButton icon="pi pi-ellipsis-h" class="p-button-sm" (click)="openMasterLocation()"></button>
                </div>
              </td>
              <td>
                <p-dropdown [(ngModel)]="trn.to_location" [options]="getLocationsByType(trn.to_location_type)" optionLabel="label" optionValue="value" [filter]="true" filterBy="label" appendTo="body" class="w-64"></p-dropdown>
              </td>
              <td><input pInputText class="bg-orange-50" [(ngModel)]="trn.vessel_airline"/></td>
              <td><input pInputText class="bg-orange-50" [(ngModel)]="trn.voyage_flight_no"/></td>
              <td>
                <p-calendar [(ngModel)]="trn.etd" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" class="w-96" [inputStyle]="{ width: '260px' }" [style]="{ width: '260px' }"></p-calendar>
              </td>
              <td>
                <p-calendar [(ngModel)]="trn.eta" [showIcon]="true" dateFormat="dd/mm/yy" appendTo="body" class="w-96" [inputStyle]="{ width: '260px' }" [style]="{ width: '260px' }"></p-calendar>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
      <p-dialog header="Location" [(visible)]="showMasterLocationDialog" [modal]="true" [style]="{width: '85vw'}" [contentStyle]="{height: '70vh'}" [draggable]="false" [resizable]="false">
        <master-location></master-location>
        <ng-template pTemplate="footer">
          <button pButton label="Close" class="p-button-secondary" (click)="closeMasterLocation()"></button>
        </ng-template>
      </p-dialog>
      <div class="flex justify-end gap-2 mt-4">
        <button pButton label="Cancel" class="p-button-secondary" (click)="showBookingForm=false"></button>
        <button pButton label="Save Draft" icon="pi pi-save" class="p-button-success" (click)="finalSave()"></button>
      </div>
      </div>
      </ng-template>
    </p-dialog>
  `,
})
export class BookingComponent implements OnInit {
  bookings: any[] = [];
  search = '';
  statusFilter = '';
  statusOptions = [
    { label: 'Open', value: 'Open' },
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Closed', value: 'Closed' },
  ];
  bookingStatusOptions: any[] = [];

  showCreateDialog = false;
  dialog: any = { department: '', service_type: '', from_location: '', to_location: '' };
  departmentOptions: any[] = [];
  departmentOptionsRaw: any[] = [];
  serviceTypeOptions: any[] = [];
  fromLocationOptions: any[] = [];
  toLocationOptions: any[] = [];
  locationMap: { [code: string]: string } = {};
  allLocations: any[] = [];
  locationTypeOptions: any[] = [];
  showMasterLocationDialog = false;
  matchingEnquiries: any[] = [];
  selectedEnquiries: any[] = [];

  showBookingForm = false;
  currentBooking: BookingRecord = { booking_type: 'manual', status: 'Open' } as any;
  isFrozen = false;
  cargoRows: any[] = [];
  carriageRows: any[] = [];
  lineItemsRows: any[] = [];
  scheduleGroups: { [service: string]: any[] } = {};
  yesNoOptions = [ { label: 'YES', value: 'YES' }, { label: 'NO', value: 'NO' } ];
  allCargoItems: MasterItem[] = [];
  cargoTypeOptions: any[] = [];

  constructor(
    private bookingService: BookingService,
    private enquiryService: EnquiryService,
    private contextService: ContextService,
    private serviceTypeService: ServiceTypeService,
    private masterLocationService: MasterLocationService,
    private masterTypeService: MasterTypeService,
    private masterItemService: MasterItemService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBookings();
    this.loadDropdowns();
  }

  loadBookings() {
    this.bookingService.getAll(1, 10, this.search, this.statusFilter).subscribe({
      next: (res) => { this.bookings = res?.data || []; this.cdr.detectChanges(); },
    });
  }

  loadDropdowns() {
    const ctx = this.contextService.getContext();
    this.enquiryService.getDepartmentsDropdown(ctx.companyCode).subscribe((rows) => {
      this.departmentOptionsRaw = rows || [];
      this.departmentOptions = this.departmentOptionsRaw.map((d: any) => ({ label: d.display_name || d.name, value: d.name }));
    });
    this.enquiryService.getLocationsDropdown('').subscribe((rows) => {
      const list = rows || [];
      const opts = list.map((l: any) => ({ label: l.display_name || l.name, value: l.code }));
      this.locationMap = {};
      for (const l of list) this.locationMap[l.code] = l.name || l.code;
      this.fromLocationOptions = opts; this.toLocationOptions = opts;
    });
    this.masterLocationService.getAll().subscribe((rows) => {
      this.allLocations = rows || [];
      const types = [...new Set(this.allLocations.map((l: any) => l.type))].filter(Boolean);
      this.locationTypeOptions = types.map(t => ({ label: t, value: t }));
    });
    this.contextService.serviceTypeOptions$.subscribe(opts => { this.serviceTypeOptions = opts || []; });
    this.masterTypeService.getAllByType('BOOKING_STATUS').subscribe(rows => {
      const list = rows || [];
      this.bookingStatusOptions = list.map((r: any) => ({ label: r.display_name || r.name || r.value || r.code, value: r.value || r.name || r.display_name || r.code }));
    });
    this.masterItemService.getAll().subscribe(items => {
      const cargoItems = (items || []).filter(it => ((it.item_type || '').toString().toUpperCase() === 'CARGO_TYPE'));
      this.allCargoItems = cargoItems;
      const types = [...new Set(cargoItems.map(ci => (ci.cargo_type || ci.charge_type || '').toString()).filter(Boolean))];
      this.cargoTypeOptions = types.map(t => ({ label: t, value: t }));
    });
  }

  openCreateDialog() {
    this.dialog = { department: '', service_type: '', from_location: '', to_location: '' };
    this.matchingEnquiries = []; this.selectedEnquiries = [];
    this.showCreateDialog = true;
  }

  onDepartmentChange() {
    const name = this.dialog.department || '';
    const found = (this.departmentOptionsRaw || []).find((d: any) => (d.name || '').toString().trim().toLowerCase() === name.toString().trim().toLowerCase());
    const deptCode = found ? found.code : '';
    if (deptCode) {
      this.contextService.loadServiceTypesForDepartment(deptCode);
    }
  }

  searchEnquiries() {
    const criteria = { ...this.dialog };
    this.bookingService.searchEnquiries(criteria).subscribe({
      next: (rows) => { this.matchingEnquiries = rows || []; },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to search enquiries' }); }
    });
  }

  saveFromEnquiries() {
    const selected = this.selectedEnquiries.map((e: any) => ({ id: e.id, code: e.code }));
    if (selected.length === 0) {
      const manual: BookingRecord = {
        booking_type: 'manual',
        department: this.dialog.department,
        service_type: this.dialog.service_type,
        from_location: this.dialog.from_location,
        to_location: this.dialog.to_location,
        status: 'Open',
      } as any;
      this.bookingService.createManualBooking(manual).subscribe({
        next: (res) => {
          this.showCreateDialog = false;
          this.loadBookings();
          this.isFrozen = false;
          const bkNo = (res && res.booking_no) ? String(res.booking_no) : '';
          if (bkNo) this.openBooking(bkNo);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Manual booking ${bkNo || ''} created` });
        },
        error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create manual booking' }); }
      });
      return;
    }
    this.bookingService.createFromEnquiries(this.dialog, selected).subscribe({
        next: (res) => {
          this.showCreateDialog = false;
          this.loadBookings();
          this.isFrozen = true;
          const bkNo = (res && res.booking_no) ? String(res.booking_no) : '';
          if (bkNo) this.openBooking(bkNo);
          this.messageService.add({ severity: 'success', summary: 'Success', detail: `Booking ${bkNo || ''} created` });
        },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create booking' }); }
    });
  }

  createManual() {
    this.isFrozen = false;
    this.currentBooking = { booking_type: 'manual', status: 'Open' } as any;
    this.showBookingForm = true;
  }

  finalSave() {
    const payload = { ...this.currentBooking, cargo: this.cargoRows, carriage_map: this.carriageRows, line_items: this.lineItemsRows, schedules: this.flattenSchedules() } as BookingRecord;
    if (this.isFrozen) { this.showBookingForm = false; return; }
    this.bookingService.createManualBooking(payload).subscribe({
      next: (res) => { this.showBookingForm = false; this.loadBookings(); this.messageService.add({ severity: 'success', summary: 'Saved', detail: `Booking ${res.booking_no} created` }); },
      error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save booking' }); }
    });
  }

  openBooking(bookingNo: string) {
    this.bookingService.getByNo(bookingNo).subscribe(b => {
      this.currentBooking = b as any;
      this.isFrozen = (b as any)?.booking_type === 'from_enquiry';
      this.cargoRows = Array.isArray((b as any)?.cargo) ? (b as any).cargo : [];
      this.carriageRows = Array.isArray((b as any)?.carriage_map) ? (b as any).carriage_map : [];
      const rawItems = Array.isArray((b as any)?.line_items) ? (b as any).line_items : [];
      const toLabel = (code: any) => this.locationMap[(code || '').toString()] || code || '';
      // Map location codes to display names and sourced vendor
      const vendorCards = Array.isArray((b as any)?.vendor_details) ? (b as any).vendor_details : ((b as any)?.vendor_details ? [(b as any).vendor_details] : []);
      this.lineItemsRows = rawItems.map((li: any) => {
        const svc = li.service_area || li.type || '';
        const match = vendorCards.find((vc: any) => (vc.service_area || '').toString().trim().toLowerCase() === (svc || '').toString().trim().toLowerCase());
        const vendorName = (match && (match.vendor_name || match.vendor || match.vendor_code)) || (vendorCards[0]?.vendor_name) || '';
        return {
          ...li,
          from_location: toLabel(li.from_location || li.line_from_location || li.line_from_location_name || ''),
          to_location: toLabel(li.to_location || li.line_to_location || li.line_to_location_name || ''),
          sourced_vendor: li.sourced_vendor || vendorName || ''
        };
      });
      // Map carriage locations to names
      this.carriageRows = (this.carriageRows || []).map((cr: any) => ({
        ...cr,
        location: toLabel(cr.location || '')
      }));
      this.currentBooking.from_location = toLabel((b as any)?.from_location || '');
      this.currentBooking.to_location = toLabel((b as any)?.to_location || '');
      const sched = Array.isArray((b as any)?.schedules) ? (b as any).schedules : [];
      this.scheduleGroups = {};
      const services = [...new Set(this.lineItemsRows.map(li => (li.service_area || li.type || 'SERVICE')))] as string[];
      for (const s of sched) {
        const key = s.service || services[0] || 'SERVICE';
        if (!this.scheduleGroups[key]) this.scheduleGroups[key] = [];
        this.scheduleGroups[key].push({ ...s });
      }
      for (const li of this.lineItemsRows) {
        const key = li.service_area || li.type || 'SERVICE';
        li.schedule = (this.scheduleGroups[key] && this.scheduleGroups[key].length > 0) ? 'YES' : 'NO';
      }
      this.showBookingForm = true;
    });
  }

  addCargoRow() { this.cargoRows = [...this.cargoRows, { cargo_type: '', description: '', hs_code: '' }]; }
  removeCargoRow(i: number) { this.cargoRows.splice(i, 1); this.cargoRows = [...this.cargoRows]; }

  addTransit(service: string) {
    if (!this.scheduleGroups[service]) this.scheduleGroups[service] = [];
    const cnt = this.scheduleGroups[service].length;
    this.scheduleGroups[service] = [...this.scheduleGroups[service], { service, transit_count: cnt, from_location_type: '', from_location: '', to_location_type: '', to_location: '', vessel_airline: '', voyage_flight_no: '', etd: '', eta: '' }];
  }
  onLineItemScheduleChange(li: any) {
    const key = li.service_area || li.type || 'SERVICE';
    if ((li.schedule || '').toString().toUpperCase() === 'YES') {
      if (!this.scheduleGroups[key] || this.scheduleGroups[key].length === 0) {
        this.addTransit(key);
      }
    } else {
      delete this.scheduleGroups[key];
    }
  }
  scheduleServiceKeys(): string[] {
    const yesServices = new Set(
      this.lineItemsRows
        .filter(li => (li.schedule || '').toString().toUpperCase() === 'YES')
        .map(li => li.service_area || li.type || 'SERVICE')
    );
    return Array.from(yesServices).filter(k => !!this.scheduleGroups[k]);
  }
  flattenSchedules(): any[] {
    const out: any[] = [];
    for (const k of Object.keys(this.scheduleGroups)) for (const t of this.scheduleGroups[k]) out.push({ ...t, service: k });
    return out;
  }
  iToOneBased(v: any) { const n = Number(v ?? 0); return isNaN(n) ? '' : (n + 1); }
  locName(code: any) { const key = (code || '').toString(); return this.locationMap[key] || key; }
  getLocationsByType(type: any) {
    const t = (type || '').toString();
    return (this.allLocations || [])
      .filter((l: any) => (l.type || '').toString() === t)
      .map((l: any) => ({ label: l.name, value: l.code }));
  }
  getCargoNamesByType(type: any) {
    const t = (type || '').toString();
    return (this.allCargoItems || [])
      .filter((ci: any) => ((ci.cargo_type || ci.charge_type || '').toString() === t))
      .map((ci: any) => ({ label: ci.name, value: ci.name }));
  }
  getHsCodesByTypeAndName(type: any, name: any) {
    const t = (type || '').toString();
    const n = (name || '').toString();
    return (this.allCargoItems || [])
      .filter((ci: any) => ((ci.cargo_type || ci.charge_type || '').toString() === t) && ((ci.name || '').toString() === n))
      .map((ci: any) => ({ label: ci.hs_code, value: ci.hs_code }));
  }
  onCargoTypeChange(cg: any) {
    const names = this.getCargoNamesByType(cg.cargo_type);
    if (names.length === 1) {
      cg.description = names[0].value;
    } else {
      cg.description = '';
    }
    const codes = this.getHsCodesByTypeAndName(cg.cargo_type, cg.description);
    if (codes.length === 1) {
      cg.hs_code = codes[0].value;
    } else {
      cg.hs_code = '';
    }
    this.cargoRows = [...this.cargoRows];
  }
  onCargoNameChange(cg: any) {
    const codes = this.getHsCodesByTypeAndName(cg.cargo_type, cg.description);
    if (codes.length === 1) {
      cg.hs_code = codes[0].value;
    } else {
      cg.hs_code = '';
    }
    this.cargoRows = [...this.cargoRows];
  }
  openMasterLocation() { this.showMasterLocationDialog = true; }
  closeMasterLocation() {
    this.showMasterLocationDialog = false;
    this.masterLocationService.getAll().subscribe(rows => { this.allLocations = rows || []; });
  }
  addLineItemRow() { this.lineItemsRows = [...this.lineItemsRows, { type: '', service_area: '', basis: '', from_location: '', to_location: '', sourced_vendor: '', basis_qty: '', booking_ref: '', valid_till: '', status: 'Active', remarks: '', schedule: 'NO' }]; }
}
