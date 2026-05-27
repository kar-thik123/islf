const fs = require('fs');

let tsContent = fs.readFileSync('src/app/pages/Operation/job-card.ts', 'utf8');

const resolveTarget = `  resolveDropdownValue(value: string, options: any[]): string {
    if (!value || !options) return value || '';
    const found = options.find(o => (o.name || o.code || o.label || '').toString().trim().toLowerCase() === value.toString().trim().toLowerCase());
    if (found) {
      if (found.name !== undefined && found.code === undefined) return found.name;
      if (found.code !== undefined) return found.code;
      if (found.value !== undefined) return found.value;
    }
    return value;
  }`;

const resolveReplacement = `  resolveDropdownValue(value: string, options: any[], returnField: string = 'name'): string {
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
  }`;

tsContent = tsContent.replace(resolveTarget, resolveReplacement);

const executeLinkTarget = `      this.currentJobCard.department = this.resolveDropdownValue(booking.department, this.departmentOptionsRaw) || booking.department;
      this.currentJobCard.service_type = this.resolveDropdownValue(booking.service_type, this.allServiceTypes) || booking.service_type;
      this.currentJobCard.company_name = booking.company_name;
      this.currentJobCard.sales_person = booking.source_sales_person;
      this.currentJobCard.from_location_type = booking.from_location_type;`;

const executeLinkReplacement = `      this.currentJobCard.department = this.resolveDropdownValue(booking.department, this.departmentOptionsRaw, 'name') || booking.department;
      this.currentJobCard.service_type = this.resolveDropdownValue(booking.service_type, this.allServiceTypes, 'name') || booking.service_type;
      this.currentJobCard.company_name = booking.company_name;
      this.currentJobCard.enquiry_type = booking.enquiry_type || 'Direct';
      this.currentJobCard.sales_person = this.resolveDropdownValue(booking.source_sales_person || booking.sales_person, this.salesPersonOptions, 'value') || booking.source_sales_person || booking.sales_person;
      this.currentJobCard.from_location_type = booking.from_location_type;`;

tsContent = tsContent.replace(executeLinkTarget, executeLinkReplacement);

fs.writeFileSync('src/app/pages/Operation/job-card.ts', tsContent, 'utf8');
console.log('Phase 10 Patch Complete.');
