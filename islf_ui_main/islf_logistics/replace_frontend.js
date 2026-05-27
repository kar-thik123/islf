const fs = require('fs');
let content = fs.readFileSync('src/app/pages/Operation/job-card.ts', 'utf8');

// 1. defaultJobCard
content = content.replace(
  /defaultJobCard\(\): JobCardRecord \{\s*return \{\s*job_date: new Date\(\).toISOString\(\)\.substring\(0, 10\),\s*enquiry_type: 'Direct',\s*status: 'Open'\s*\};\s*\}/,
  \`defaultJobCard(): JobCardRecord {
    return {
      job_date: new Date().toISOString().substring(0, 10),
      enquiry_type: 'Direct',
      status: 'Open',
      linked_bookings: []
    };
  }\`
);

// 2. Header UI (replace mb-4 flex gap-2 and Job Card No row)
const headerTarget = \`<div class="mb-4 flex gap-2" *ngIf="!isEditMode">
            <button pButton type="button" label="Link Booking" icon="pi pi-link" class="p-button-sm p-button-success" (click)="openBookingLinkDialog()"></button>
            <button *ngIf="currentJobCard.booking_no" type="button" pButton label="Clear Link" icon="pi pi-times-circle" class="p-button-sm p-button-danger p-button-outlined" (click)="clearBookingLink()"></button>
          </div>

          <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-3">
              <label class="block mb-1">Job Card No</label>
              <input pInputText [disabled]="true" [ngModel]="currentJobCard.job_card_no" placeholder="Auto-generated" class="bg-gray-100" />
            </div>

            <div class="col-span-3">
              <label class="block mb-1">Job Date <span class="text-red-500">*</span></label>
              <p-calendar [(ngModel)]="currentJobCard.job_date" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" [style]="{'width':'100%'}"></p-calendar>
            </div>

            <div class="col-span-3" *ngIf="currentJobCard.booking_no">
              <label class="block mb-1 text-green-700">Linked Booking No</label>
              <input pInputText [disabled]="true" [ngModel]="currentJobCard.booking_no" class="bg-green-50 text-green-800 font-bold" />
            </div>\`;

const headerReplacement = \`<div class="mb-4 flex gap-2 flex-wrap items-center">
            <button pButton type="button" [label]="(currentJobCard.linked_bookings?.length > 0 || currentJobCard.booking_no) ? 'Append Booking' : 'Link Booking'" icon="pi pi-link" class="p-button-sm p-button-success" (click)="openBookingLinkDialog()"></button>
            <button *ngIf="currentJobCard.booking_no || currentJobCard.linked_bookings?.length > 0" type="button" pButton label="Clear All Links" icon="pi pi-times-circle" class="p-button-sm p-button-danger p-button-outlined" (click)="clearBookingLink()"></button>
            
            <div class="flex gap-2 ml-4">
              <span *ngIf="currentJobCard.booking_no" class="px-2 py-1 bg-green-100 text-green-800 rounded font-bold text-sm">
                {{currentJobCard.booking_no}}
              </span>
              <span *ngFor="let lb of currentJobCard.linked_bookings" class="px-2 py-1 bg-green-100 text-green-800 rounded font-bold text-sm">
                {{lb.booking_no}}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-3">
              <label class="block mb-1">Job Card No</label>
              <input pInputText [disabled]="true" [ngModel]="currentJobCard.job_card_no" placeholder="Auto-generated" class="bg-gray-100" />
            </div>

            <div class="col-span-3">
              <label class="block mb-1">Job Date <span class="text-red-500">*</span></label>
              <p-calendar [(ngModel)]="currentJobCard.job_date" [showIcon]="true" [dateFormat]="configService.calendarDateFormat" appendTo="body" [style]="{'width':'100%'}"></p-calendar>
            </div>\`;
content = content.replace(headerTarget, headerReplacement);


// 3. Breakup Table Header & Body
const breakupTableHeaderTarget = \`<tr>
                <th>Vendor Booking No</th>
                <th>Basis <span class="text-red-500">*</span></th>
                <th>Container No</th>\`;
const breakupTableHeaderReplacement = \`<tr>
                <th>Source Booking</th>
                <th>Vendor Booking No</th>
                <th>Basis <span class="text-red-500">*</span></th>
                <th>Container No</th>\`;
content = content.replace(breakupTableHeaderTarget, breakupTableHeaderReplacement);

const breakupTableBodyTarget = \`<tr>
                <td>
                  <input pInputText [(ngModel)]="row.vendor_booking_no" placeholder="Vendor Booking No" [style]="{'width':'100%'}" />
                </td>
                <td>
                  <p-dropdown [options]="basisOptions" [(ngModel)]="row.basis"\`;
const breakupTableBodyReplacement = \`<tr>
                <td>
                  <span class="font-bold text-gray-700">{{row.booking_no || '-'}}</span>
                </td>
                <td>
                  <input pInputText [(ngModel)]="row.vendor_booking_no" placeholder="Vendor Booking No" [style]="{'width':'100%'}" />
                </td>
                <td>
                  <p-dropdown [options]="basisOptions" [(ngModel)]="row.basis"\`;
content = content.replace(breakupTableBodyTarget, breakupTableBodyReplacement);


// 4. Allocation Table Header & Body
const allocHeaderTarget = \`<th>Remarks</th>
              <th>Status</th>
            </tr>\`;
const allocHeaderReplacement = \`<th>Remarks</th>
              <th>Owner / Status</th>
            </tr>\`;
content = content.replace(allocHeaderTarget, allocHeaderReplacement);

const allocBodyTarget = \`<td>
                <span [class]="row.disabled ? 'text-red-500 font-bold' : 'text-green-500 font-bold'">
                  {{ row.disabled ? 'Allocated' : 'Available' }}
                </span>
              </td>\`;
const allocBodyReplacement = \`<td>
                <span [class]="row.disabled ? 'text-red-500 font-bold' : 'text-green-500 font-bold'">
                  {{ row.disabled ? (row.owner_job || 'Allocated') : 'Available' }}
                </span>
              </td>\`;
content = content.replace(allocBodyTarget, allocBodyReplacement);


// 5. executeBookingLink
const executeTarget = \`executeBookingLink(booking: any) {
    this.currentJobCard.booking_id = booking.id;
    this.currentJobCard.booking_no = booking.booking_no;
    this.currentJobCard.department = booking.department;
    this.currentJobCard.service_type = booking.service_type;
    this.currentJobCard.company_name = booking.company_name;
    this.currentJobCard.sales_person = booking.source_sales_person;
    this.currentJobCard.from_location_type = booking.from_location_type;
    this.currentJobCard.from_location = this.resolveLocationCodeFromName(booking.from_location);
    this.currentJobCard.to_location_type = booking.to_location_type;
    this.currentJobCard.to_location = this.resolveLocationCodeFromName(booking.to_location);
    this.currentJobCard.general_remarks = booking.remarks || '';

    const jobDateVal = booking.effective_date_from || booking.created_at || new Date().toISOString();
    try {
      const monthName = new Date(jobDateVal).toLocaleString('default', { month: 'long' });
      this.currentJobCard.job_month = monthName;
    } catch(e) {
      this.currentJobCard.job_month = '';
    }

    this.onLocationTypeChange('from');
    this.onLocationTypeChange('to');
    this.onDepartmentChange();

    this.lineItemRows = (booking.line_items || []).map((li: any, idx: number) => ({
      s_no: idx + 1,
      type: li.type,
      service_area: li.service_area,
      vendor: li.sourced_vendor || li.vendor,
      vendor_booking_no: li.vendor_booking_no || '',
      basis: li.basis,
      qty: li.qty ?? li.quantity ?? 1
    }));

    this.cargoRows = (booking.cargo || []).map((cg: any) => {
      const cargoType = cg.cargo_type || cg.type;
      const cargoName = cg.description || cg.cargo_name || '';
      return {
        cargo_type: cargoType,
        cargo_name: cargoName,
        hs_code: cg.hs_code || '',
        remarks: cg.remarks || '',
        _descriptionOptions: this.getCargoNamesByType(cargoType)
      };
    });

    this.scheduleRows = (booking.schedules || []).map((sc: any) => ({
      from_location: sc.from_location || sc.location,
      to_location: sc.to_location,
      vessel_airline: sc.vessel_airline,
      voyage_flight_no: sc.voyage_flight_no,
      etd: sc.etd || sc.schedule_date ? new Date(sc.etd || sc.schedule_date) : null,
      eta: sc.eta ? new Date(sc.eta) : null
    }));

    this.breakupRows = this.allocationSelectionRows
      .filter(row => row.selected)
      .map(row => ({
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

    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Booking linked successfully' });
    this.showForm = true;
  }\`;

const executeReplacement = \`executeBookingLink(booking: any) {
    if (!this.currentJobCard.booking_no) {
      // First booking linked
      this.currentJobCard.booking_id = booking.id;
      this.currentJobCard.booking_no = booking.booking_no;
      this.currentJobCard.department = booking.department;
      this.currentJobCard.service_type = booking.service_type;
      this.currentJobCard.company_name = booking.company_name;
      this.currentJobCard.sales_person = booking.source_sales_person;
      this.currentJobCard.from_location_type = booking.from_location_type;
      this.currentJobCard.from_location = this.resolveLocationCodeFromName(booking.from_location);
      this.currentJobCard.to_location_type = booking.to_location_type;
      this.currentJobCard.to_location = this.resolveLocationCodeFromName(booking.to_location);
      this.currentJobCard.general_remarks = booking.remarks || '';

      const jobDateVal = booking.effective_date_from || booking.created_at || new Date().toISOString();
      try {
        const monthName = new Date(jobDateVal).toLocaleString('default', { month: 'long' });
        this.currentJobCard.job_month = monthName;
      } catch(e) {
        this.currentJobCard.job_month = '';
      }

      this.onLocationTypeChange('from');
      this.onLocationTypeChange('to');
      this.onDepartmentChange();
    } else {
      // Append Booking
      if (!this.currentJobCard.linked_bookings) {
        this.currentJobCard.linked_bookings = [];
      }
      // Check if already linked
      const alreadyLinked = this.currentJobCard.booking_no === booking.booking_no || 
                            this.currentJobCard.linked_bookings.some((lb: any) => lb.booking_no === booking.booking_no);
      if (!alreadyLinked) {
        this.currentJobCard.linked_bookings.push({ booking_id: booking.id, booking_no: booking.booking_no });
      }
    }

    // Append child rows
    const newLineItems = (booking.line_items || []).map((li: any, idx: number) => ({
      s_no: this.lineItemRows.length + idx + 1,
      type: li.type,
      service_area: li.service_area,
      vendor: li.sourced_vendor || li.vendor,
      vendor_booking_no: li.vendor_booking_no || '',
      basis: li.basis,
      qty: li.qty ?? li.quantity ?? 1
    }));
    this.lineItemRows = [...this.lineItemRows, ...newLineItems];

    const newCargo = (booking.cargo || []).map((cg: any) => {
      const cargoType = cg.cargo_type || cg.type;
      const cargoName = cg.description || cg.cargo_name || '';
      return {
        cargo_type: cargoType,
        cargo_name: cargoName,
        hs_code: cg.hs_code || '',
        remarks: cg.remarks || '',
        _descriptionOptions: this.getCargoNamesByType(cargoType)
      };
    });
    this.cargoRows = [...this.cargoRows, ...newCargo];

    const newSchedules = (booking.schedules || []).map((sc: any) => ({
      from_location: sc.from_location || sc.location,
      to_location: sc.to_location,
      vessel_airline: sc.vessel_airline,
      voyage_flight_no: sc.voyage_flight_no,
      etd: sc.etd || sc.schedule_date ? new Date(sc.etd || sc.schedule_date) : null,
      eta: sc.eta ? new Date(sc.eta) : null
    }));
    this.scheduleRows = [...this.scheduleRows, ...newSchedules];

    const newBreakups = this.allocationSelectionRows
      .filter(row => row.selected)
      .map(row => ({
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
    this.breakupRows = [...this.breakupRows, ...newBreakups];

    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Booking appended successfully' });
    this.showForm = true;
  }\`;
content = content.replace(executeTarget, executeReplacement);

// 6. clearBookingLink
const clearTarget = \`clearBookingLink() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to clear the Booking link? The Job Card will become a manual Job Card.',
      header: 'Clear Booking Link',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.currentJobCard.booking_id = undefined;
        this.currentJobCard.booking_no = undefined;
        this.messageService.add({ severity: 'info', summary: 'Unlinked', detail: 'Booking link cleared.' });
      }
    });
  }\`;
const clearReplacement = \`clearBookingLink() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to clear ALL Booking links? The Job Card will become a manual Job Card.',
      header: 'Clear Booking Link',
      icon: 'pi pi-question-circle',
      accept: () => {
        this.currentJobCard.booking_id = undefined;
        this.currentJobCard.booking_no = undefined;
        this.currentJobCard.linked_bookings = [];
        this.messageService.add({ severity: 'info', summary: 'Unlinked', detail: 'All Booking links cleared.' });
      }
    });
  }\`;
content = content.replace(clearTarget, clearReplacement);

// 7. buildAllocationSelectionRows -> to map job_card_no
const buildAllocTarget = \`buildAllocationSelectionRows(booking: any, allocations: any[]) {
    this.allocationSelectionRows = [];\`;
const buildAllocReplacement = \`buildAllocationSelectionRows(booking: any, allocations: any[]) {
    this.allocationSelectionRows = [];
    const allocMap = new Map<string, string>(); // key -> job_card_no
    allocations.forEach(a => {
       const key = a.booking_breakup_id + '_' + a.breakup_type;
       allocMap.set(key, a.job_card_no);
    });\`;
content = content.replace(buildAllocTarget, buildAllocReplacement);

const disabledCheckTarget = \`const disabled = !!existingAlloc;\`;
const disabledCheckReplacement = \`const disabled = !!existingAlloc;
      const owner_job = existingAlloc ? allocMap.get(item.id + '_' + type) : null;\`;
content = content.replace(disabledCheckTarget, disabledCheckReplacement);

const pushRowTarget = \`disabled,
        selected: !disabled\`;
const pushRowReplacement = \`disabled,
        owner_job,
        selected: !disabled\`;
content = content.replace(pushRowTarget, pushRowReplacement);


fs.writeFileSync('src/app/pages/Operation/job-card.ts', content, 'utf8');
console.log('Frontend script replacement completed');
