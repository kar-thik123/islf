const fs = require('fs');

// PATCH JOB CARD TS
let tsContent = fs.readFileSync('src/app/pages/Operation/job-card.ts', 'utf8');

// Phase 1: State Leakage Fix
// Add this.allocationSelectionRows = [] to openCreateDialog
tsContent = tsContent.replace(
  `    this.breakupRows = [];`,
  `    this.breakupRows = [];\n    this.allocationSelectionRows = [];`
);
// Add to loadJobCardDetails around line 1181
tsContent = tsContent.replace(
  `      this.breakupRows = [];\n\n      this.onLocationTypeChange('from');`,
  `      this.breakupRows = [];\n      this.allocationSelectionRows = [];\n\n      this.onLocationTypeChange('from');`
);

// Phase 3: Header Hydration Fix
// Inject resolve helper at the bottom of the class
if (!tsContent.includes('resolveDropdownValue')) {
  tsContent = tsContent.replace(
    `  defaultJobCard(): JobCardRecord {`,
    `  resolveDropdownValue(value: string, options: any[]): string {
    if (!value || !options) return value || '';
    const found = options.find(o => (o.name || o.code || o.label || '').toString().trim().toLowerCase() === value.toString().trim().toLowerCase());
    if (found) {
      if (found.name !== undefined && found.code === undefined) return found.name;
      if (found.code !== undefined) return found.code;
      if (found.value !== undefined) return found.value;
    }
    return value;
  }

  defaultJobCard(): JobCardRecord {`
  );
}

// Modify executeBookingLink for header resolution
const executeBookingHeaderTarget = `      this.currentJobCard.department = booking.department;
      this.currentJobCard.service_type = booking.service_type;
      this.currentJobCard.company_name = booking.company_name;
      this.currentJobCard.sales_person = booking.source_sales_person;
      this.currentJobCard.from_location_type = booking.from_location_type;
      this.currentJobCard.from_location = this.resolveLocationCodeFromName(booking.from_location);
      this.currentJobCard.to_location_type = booking.to_location_type;
      this.currentJobCard.to_location = this.resolveLocationCodeFromName(booking.to_location);`;

const executeBookingHeaderReplacement = `      this.currentJobCard.department = this.resolveDropdownValue(booking.department, this.departmentOptionsRaw) || booking.department;
      this.currentJobCard.service_type = this.resolveDropdownValue(booking.service_type, this.allServiceTypes) || booking.service_type;
      this.currentJobCard.company_name = booking.company_name;
      this.currentJobCard.sales_person = booking.source_sales_person;
      this.currentJobCard.from_location_type = booking.from_location_type;
      this.currentJobCard.from_location = this.resolveLocationCodeFromName(booking.from_location);
      this.currentJobCard.to_location_type = booking.to_location_type;
      this.currentJobCard.to_location = this.resolveLocationCodeFromName(booking.to_location);`;

tsContent = tsContent.replace(executeBookingHeaderTarget, executeBookingHeaderReplacement);

// Phase 4, 5, 6: Adapters
const lineItemsTarget = `    const newLineItems = (booking.line_items || []).map((li: any, idx: number) => ({
      type: li.type,
      service_area: li.service_area,
      vendor: li.sourced_vendor || li.vendor,
      vendor_booking_no: li.vendor_booking_no || '',
      basis: li.basis,
      qty: li.qty ?? li.quantity ?? 1
    }));`;

const lineItemsReplacement = `    // LINE ITEM ADAPTER: booking.line_items do not have execution fields
    const newLineItems = (booking.line_items || []).map((li: any, idx: number) => ({
      type: '',
      service_area: '',
      vendor: '',
      vendor_booking_no: '',
      basis: li.basis || '',
      qty: 1
    }));`;

tsContent = tsContent.replace(lineItemsTarget, lineItemsReplacement);

const cargoTarget = `    const newCargo = (booking.cargo || []).map((cg: any) => {
      const cargoType = cg.cargo_type || cg.type;
      const cargoName = cg.description || cg.cargo_name || '';
      return {
        cargo_type: cargoType,
        cargo_name: cargoName,
        hs_code: cg.hs_code || '',
        remarks: cg.remarks || '',
        _descriptionOptions: this.getCargoNamesByType(cargoType)
      };
    });`;

const cargoReplacement = `    // CARGO ADAPTER: Safely map without aggressive execution auto-mapping
    const newCargo = (booking.cargo || []).map((cg: any) => {
      return {
        cargo_type: cg.cargo_type || '',
        cargo_name: cg.description || '',
        hs_code: '', // execution field
        remarks: cg.remarks || '',
        _descriptionOptions: this.getCargoNamesByType(cg.cargo_type || '')
      };
    });`;

tsContent = tsContent.replace(cargoTarget, cargoReplacement);

const schedulesTarget = `    const newSchedules = (booking.schedules || []).map((sc: any) => ({
      from_location: sc.from_location || sc.location,
      to_location: sc.to_location,
      vessel_airline: sc.vessel_airline,
      voyage_flight_no: sc.voyage_flight_no,
      etd: sc.etd || sc.schedule_date ? new Date(sc.etd || sc.schedule_date) : null,
      eta: sc.eta ? new Date(sc.eta) : null
    }));`;

const schedulesReplacement = `    // SCHEDULE ADAPTER: Safely initialize execution fields
    const newSchedules = (booking.schedules || []).map((sc: any) => ({
      from_location: '',
      to_location: '',
      vessel_airline: '',
      voyage_flight_no: '',
      etd: null,
      eta: null
    }));`;

tsContent = tsContent.replace(schedulesTarget, schedulesReplacement);

// Remove the scary confirm message for append.
const confirmTarget = `    if (hasData) {
      this.confirmationService.confirm({
        message: 'This action will replace existing Job Card data linked from the previous/manual entry. Do you want to continue?',
        header: 'Replace Existing Data?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.executeBookingLink(this.tempBookingDetails);
        }
      });
    } else {
      this.executeBookingLink(this.tempBookingDetails);
    }`;

const confirmReplacement = `    this.executeBookingLink(this.tempBookingDetails);`;
tsContent = tsContent.replace(confirmTarget, confirmReplacement);


fs.writeFileSync('src/app/pages/Operation/job-card.ts', tsContent, 'utf8');

// PATCH JOB CARD JS (Backend)
let jsContent = fs.readFileSync('../../islf_server_main/routes/job_card.js', 'utf8');

// Remove Regex fallback:
// const nextNoRes = await client.query(`SELECT COALESCE(MAX(CAST(SUBSTRING(job_card_no FROM '[0-9]+') AS INTEGER)), 0) + 1 AS next_no FROM job_card WHERE job_card_no ~ '^JBC[0-9]+$'`);
const regexFallbackTarget = `          const nextNoRes = await client.query(\`SELECT COALESCE(MAX(CAST(SUBSTRING(job_card_no FROM '[0-9]+') AS INTEGER)), 0) + 1 AS next_no FROM job_card WHERE job_card_no ~ '^JBC[0-9]+$'\`);
          job_card_no = 'JBC' + nextNoRes.rows[0].next_no.toString().padStart(6, '0');`;

const regexFallbackReplacement = `          // Phase 2 Fix: No fallback regex generator. Allow manual entry if no numbering series exists.
          if (!job_card_no) {
            throw new Error('No active Job Card numbering configuration found. Please enter Job Card number manually.');
          }`;

jsContent = jsContent.replace(regexFallbackTarget, regexFallbackReplacement);

fs.writeFileSync('../../islf_server_main/routes/job_card.js', jsContent, 'utf8');

console.log('Patch complete.');
