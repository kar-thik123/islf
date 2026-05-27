const fs = require('fs');
let content = fs.readFileSync('src/app/pages/Operation/job-card.ts', 'utf8');

// 1. Remove [disabled]="isLinked" from the HTML
content = content.replace(/\[disabled\]="isLinked"/g, '');

// 2. Add previousCoreFields state
const stateTarget = `  currentJobCard: JobCardRecord = this.defaultJobCard();`;
const stateReplacement = `  currentJobCard: JobCardRecord = this.defaultJobCard();
  previousCoreFields: any = {};`;
content = content.replace(stateTarget, stateReplacement);

// 3. Add snapshot function
const snapshotTarget = `  defaultJobCard(): JobCardRecord {`;
const snapshotReplacement = `  snapshotCoreFields() {
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
        message: 'Changing General Details will clear:\\n• Linked Bookings\\n• Selected Containers/Packages\\n• Cargo Details\\n• Schedule Details\\n• Vendor Mapping\\n\\nContinue?',
        header: 'Warning: Operational Reset',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          // Release and Clear Grids
          this.currentJobCard.booking_no = '';
          this.currentJobCard.linked_bookings = [];
          this.breakupRows = [];
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

  defaultJobCard(): JobCardRecord {`;
content = content.replace(snapshotTarget, snapshotReplacement);

// 4. Trigger snapshot on edit load and open create
const openCreateTarget = `  openCreateDialog() {
    this.isEditMode = false;
    this.currentJobCard = this.defaultJobCard();`;
const openCreateReplacement = `  openCreateDialog() {
    this.isEditMode = false;
    this.currentJobCard = this.defaultJobCard();
    this.snapshotCoreFields();`;
content = content.replace(openCreateTarget, openCreateReplacement);

const loadJobTarget = `  loadJobCardDetails(id: number) {
    this.isLoadingJobCard = true;
    this.jobCardService.getById(id).subscribe({
      next: (res: any) => {
        this.currentJobCard = res.jobCard;`;
const loadJobReplacement = `  loadJobCardDetails(id: number) {
    this.isLoadingJobCard = true;
    this.jobCardService.getById(id).subscribe({
      next: (res: any) => {
        this.currentJobCard = res.jobCard;
        this.snapshotCoreFields();`;
content = content.replace(loadJobTarget, loadJobReplacement);

// 5. Add (onChange)="onCoreFieldChange('...')" to HTML
const depsTarget = `(onChange)="onDepartmentChange()"`;
const depsReplacement = `(onChange)="onDepartmentChange(); onCoreFieldChange('department')"`;
content = content.replace(depsTarget, depsReplacement);

const srvTarget = `[(ngModel)]="currentJobCard.service_type" placeholder="Select Service Type" appendTo="body"`;
const srvReplacement = `[(ngModel)]="currentJobCard.service_type" (onChange)="onCoreFieldChange('service_type')" placeholder="Select Service Type" appendTo="body"`;
content = content.replace(srvTarget, srvReplacement);

const enqTarget = `[(ngModel)]="currentJobCard.enquiry_type" placeholder="Select Enquiry Type" appendTo="body"`;
const enqReplacement = `[(ngModel)]="currentJobCard.enquiry_type" (onChange)="onCoreFieldChange('enquiry_type')" placeholder="Select Enquiry Type" appendTo="body"`;
content = content.replace(enqTarget, enqReplacement);

const fromTypeTarget = `(onChange)="onLocationTypeChange('from')"`;
const fromTypeReplacement = `(onChange)="onLocationTypeChange('from'); onCoreFieldChange('from_location_type')"`;
content = content.replace(fromTypeTarget, fromTypeReplacement);

const fromLocTarget = `[(ngModel)]="currentJobCard.from_location" [filter]="true" filterBy="label" placeholder="Select From Location" appendTo="body"`;
const fromLocReplacement = `[(ngModel)]="currentJobCard.from_location" (onChange)="onCoreFieldChange('from_location')" [filter]="true" filterBy="label" placeholder="Select From Location" appendTo="body"`;
content = content.replace(fromLocTarget, fromLocReplacement);

const toTypeTarget = `(onChange)="onLocationTypeChange('to')"`;
const toTypeReplacement = `(onChange)="onLocationTypeChange('to'); onCoreFieldChange('to_location_type')"`;
content = content.replace(toTypeTarget, toTypeReplacement);

const toLocTarget = `[(ngModel)]="currentJobCard.to_location" [filter]="true" filterBy="label" placeholder="Select To Location" appendTo="body"`;
const toLocReplacement = `[(ngModel)]="currentJobCard.to_location" (onChange)="onCoreFieldChange('to_location')" [filter]="true" filterBy="label" placeholder="Select To Location" appendTo="body"`;
content = content.replace(toLocTarget, toLocReplacement);

fs.writeFileSync('src/app/pages/Operation/job-card.ts', content, 'utf8');
console.log('Frontend logic updated successfully.');
