const fs = require('fs');

let tsContent = fs.readFileSync('src/app/pages/Operation/job-card.ts', 'utf8');

const executeLinkTargetStart = `  executeBookingLink(booking: any) {`;
const executeLinkTargetEnd = `    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Booking linked successfully' });
    this.showForm = true;
  }`;

const adapterFunction = `  bookingToJobAdapter(booking: any, options: any) {
    const header = {
      booking_id: booking.id,
      booking_no: booking.booking_no,
      department: this.resolveDropdownValue(booking.department, options.departmentOptionsRaw, 'name') || booking.department,
      service_type: this.resolveDropdownValue(booking.service_type, options.allServiceTypes, 'name') || booking.service_type,
      company_name: booking.company_name,
      enquiry_type: booking.enquiry_type || 'Direct',
      sales_person: this.resolveDropdownValue(booking.source_sales_person || booking.sales_person, options.salesPersonOptions, 'value') || booking.source_sales_person || booking.sales_person,
      from_location_type: booking.from_location_type,
      from_location: this.resolveLocationCodeFromName(booking.from_location),
      to_location_type: booking.to_location_type,
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
      .filter((row: any) => row.selected)
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
  }`;

// Replace the entire executeBookingLink block
const startIndex = tsContent.indexOf(executeLinkTargetStart);
const endIndex = tsContent.indexOf(executeLinkTargetEnd) + executeLinkTargetEnd.length;
tsContent = tsContent.slice(0, startIndex) + adapterFunction + tsContent.slice(endIndex);

// Replace the number generation placeholder
// [disabled]="isEditMode" [(ngModel)]="currentJobCard.job_card_no" placeholder="Auto-generated / Manual Entry"
tsContent = tsContent.replace(
  `[disabled]="isEditMode" [(ngModel)]="currentJobCard.job_card_no" placeholder="Auto-generated / Manual Entry"`,
  `[disabled]="isEditMode" [(ngModel)]="currentJobCard.job_card_no" placeholder=""`
);

fs.writeFileSync('src/app/pages/Operation/job-card.ts', tsContent, 'utf8');
console.log('Adapter Patch Complete.');
