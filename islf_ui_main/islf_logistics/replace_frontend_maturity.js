const fs = require('fs');

let content = fs.readFileSync('src/app/pages/Operation/job-card.ts', 'utf8');

// 1. Soft Validation UX for verifyAndPrepareAllocation
const verifyTarget = \`    if (errors.length > 0) {
      this.confirmationService.confirm({
        message: 'Booking could not be linked due to mismatch in core fields:\\n' + errors.join('\\n'),
        header: 'Linking Blocked',
        icon: 'pi pi-times-circle',
        rejectVisible: false,
        acceptLabel: 'OK',
        accept: () => {}
      });
      return;
    }

    this.jobCardService.getAllocationsByBooking(booking.id).subscribe({\`;

const verifyReplacement = \`    if (errors.length > 0) {
      this.confirmationService.confirm({
        message: 'The selected booking has operational mismatches:\\n' + errors.join('\\n') + '\\n\\nAre you sure you want to append it anyway?',
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
    this.jobCardService.getAllocationsByBooking(booking.id).subscribe({\`;

content = content.replace(verifyTarget, verifyReplacement);


// 2. Add (x) to Linked Bookings Chips and `<p-tag>` for Owner
const chipsTarget = \`              <span *ngFor="let lb of currentJobCard.linked_bookings" class="px-2 py-1 bg-green-100 text-green-800 rounded font-bold text-sm flex items-center gap-1">
                {{lb.booking_no}}
              </span>\`;
const chipsReplacement = \`              <span *ngFor="let lb of currentJobCard.linked_bookings; let i = index" class="px-2 py-1 bg-green-100 text-green-800 rounded font-bold text-sm flex items-center gap-1">
                {{lb.booking_no}}
                <i class="pi pi-times cursor-pointer text-xs ml-1 hover:text-red-600" (click)="removeSpecificBookingLink(i, lb.booking_id, lb.booking_no)"></i>
              </span>\`;
content = content.replace(chipsTarget, chipsReplacement);


// 3. Targeted Removal Logic
const removeLogicTarget = \`clearBookingLink() {\`;
const removeLogicReplacement = \`  removeSpecificBookingLink(index: number, bookingId: number, bookingNo: string) {
    const activeBreakups = this.breakupRows.filter(r => r.booking_id === bookingId || r.booking_no === bookingNo);
    
    if (activeBreakups.length > 0) {
      this.confirmationService.confirm({
        message: \`Booking \${bookingNo} still has \${activeBreakups.length} active breakup allocations in this Job. Removing the booking will release these allocations. Continue?\`,
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
    this.currentJobCard.linked_bookings.splice(index, 1);
    // Remove purely source-linked breakups
    this.breakupRows = this.breakupRows.filter(r => !(r.booking_id === bookingId || r.booking_no === bookingNo));
    
    // Note: We DO NOT blindly delete lineItemRows or cargoRows here to prevent destroying manually edited data.
    this.messageService.add({ severity: 'info', summary: 'Unlinked', detail: \`Booking \${bookingNo} unlinked successfully.\` });
  }

  clearBookingLink() {\`;
content = content.replace(removeLogicTarget, removeLogicReplacement);


// 4. Duplicate Breakup Protection in executeBookingLink
// We need to deduplicate Breakup arrays and Line Items arrays
const executeAppendTarget = \`    const newBreakups = this.allocationSelectionRows
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
    this.breakupRows = [...this.breakupRows, ...newBreakups];\`;

const executeAppendReplacement = \`    const newBreakups = this.allocationSelectionRows
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
      
    // Duplicate Protection Filter
    const safeNewBreakups = newBreakups.filter(nb => {
      return !this.breakupRows.some(eb => 
        (eb.booking_breakup_id && eb.booking_breakup_id === nb.booking_breakup_id && eb.breakup_type === nb.breakup_type) ||
        (eb.container_no && nb.container_no && eb.container_no.toLowerCase() === nb.container_no.toLowerCase()) ||
        (eb.breakup_no && nb.breakup_no && eb.breakup_no.toLowerCase() === nb.breakup_no.toLowerCase())
      );
    });
    
    this.breakupRows = [...this.breakupRows, ...safeNewBreakups];\`;
content = content.replace(executeAppendTarget, executeAppendReplacement);


// 5. Line items deduplication
const lineItemAppendTarget = \`    const newLineItems = (booking.line_items || []).map((li: any, idx: number) => ({
      s_no: this.lineItemRows.length + idx + 1,
      type: li.type,
      service_area: li.service_area,
      vendor: li.sourced_vendor || li.vendor,
      vendor_booking_no: li.vendor_booking_no || '',
      basis: li.basis,
      qty: li.qty ?? li.quantity ?? 1
    }));
    this.lineItemRows = [...this.lineItemRows, ...newLineItems];\`;

const lineItemAppendReplacement = \`    const newLineItems = (booking.line_items || []).map((li: any, idx: number) => ({
      type: li.type,
      service_area: li.service_area,
      vendor: li.sourced_vendor || li.vendor,
      vendor_booking_no: li.vendor_booking_no || '',
      basis: li.basis,
      qty: li.qty ?? li.quantity ?? 1
    }));
    
    const safeNewLineItems = newLineItems.filter(nli => {
      return !this.lineItemRows.some(eli => 
        eli.type === nli.type && 
        eli.service_area === nli.service_area && 
        eli.basis === nli.basis && 
        (eli.vendor_booking_no === nli.vendor_booking_no)
      );
    });
    
    // Renumber after appending
    const mergedLineItems = [...this.lineItemRows, ...safeNewLineItems];
    mergedLineItems.forEach((li, idx) => { li.s_no = idx + 1; });
    this.lineItemRows = mergedLineItems;\`;
content = content.replace(lineItemAppendTarget, lineItemAppendReplacement);


// 6. Source Booking UI tag
const sourceBookingTarget = \`                  <span class="font-bold text-gray-700">{{row.booking_no || '-'}}</span>\`;
const sourceBookingReplacement = \`                  <p-tag [value]="row.booking_no || 'Manual'" [severity]="row.booking_no ? 'success' : 'info'"></p-tag>\`;
content = content.replace(sourceBookingTarget, sourceBookingReplacement);


// 7. Allocation Owner tag
const allocOwnerTarget = \`                  {{ row.disabled ? (row.owner_job || 'Allocated') : 'Available' }}\`;
const allocOwnerReplacement = \`                  <p-tag [value]="row.disabled ? (row.owner_job || 'Allocated') : 'Available'" [severity]="row.disabled ? 'warning' : 'success'"></p-tag>\`;
content = content.replace(allocOwnerTarget, allocOwnerReplacement);

fs.writeFileSync('src/app/pages/Operation/job-card.ts', content, 'utf8');
console.log('Frontend Maturity script completed');
