// MOCK JOB CARD STATE & METHODS
const state = {
  currentJobCard: { booking_no: '', department: '', service_type: '', linked_bookings: [] },
  breakupRows: [],
  allocationSelectionRows: [],
  cargoRows: [],
  lineItemRows: [],
  scheduleRows: [],
  departmentOptionsRaw: [ { name: 'Operations', code: 'OPS' }, { name: 'Sales', code: 'SLS' } ],
  allServiceTypes: [ { name: 'Ocean Freight', code: 'OF' }, { name: 'Air Freight', code: 'AF' } ]
};

function resolveDropdownValue(value, options) {
  if (!value || !options) return value || '';
  const found = options.find(o => (o.name || o.code || o.label || '').toString().trim().toLowerCase() === value.toString().trim().toLowerCase());
  if (found) {
    if (found.name !== undefined && found.code === undefined) return found.name;
    if (found.code !== undefined) return found.code;
    if (found.value !== undefined) return found.value;
  }
  return value;
}

function openCreateDialog() {
  console.log('[TRACE] openCreateDialog() BEFORE:', JSON.stringify(state));
  state.currentJobCard = { booking_no: '', department: '', service_type: '', linked_bookings: [] };
  state.breakupRows = [];
  state.allocationSelectionRows = [];
  state.cargoRows = [];
  state.lineItemRows = [];
  state.scheduleRows = [];
  console.log('[TRACE] openCreateDialog() AFTER:', JSON.stringify(state));
}

function buildAllocationSelectionRows(booking) {
  console.log('[TRACE] buildAllocationSelectionRows() BEFORE:', JSON.stringify(state.allocationSelectionRows));
  const rows = [];
  (booking.booking_breakup || []).forEach(bk => {
    rows.push({
      booking_breakup_id: bk.id,
      breakup_type: 'general',
      container_no: bk.container_no,
      selected: false // In reality, the user manually selects them
    });
  });
  state.allocationSelectionRows = rows;
  console.log('[TRACE] buildAllocationSelectionRows() AFTER:', JSON.stringify(state.allocationSelectionRows));
}

function executeBookingLink(booking) {
  console.log('[TRACE] executeBookingLink() BEFORE - Header:', JSON.stringify(state.currentJobCard));
  console.log('[TRACE] executeBookingLink() BEFORE - Breakups:', JSON.stringify(state.breakupRows));
  
  if (!state.currentJobCard.booking_no) {
    state.currentJobCard.booking_id = booking.id;
    state.currentJobCard.booking_no = booking.booking_no;
    state.currentJobCard.department = resolveDropdownValue(booking.department, state.departmentOptionsRaw) || booking.department;
    state.currentJobCard.service_type = resolveDropdownValue(booking.service_type, state.allServiceTypes) || booking.service_type;
  } else {
    if (!state.currentJobCard.linked_bookings) state.currentJobCard.linked_bookings = [];
    state.currentJobCard.linked_bookings.push({ booking_id: booking.id, booking_no: booking.booking_no });
  }

  // Breakups
  const newBreakups = state.allocationSelectionRows
    .filter(row => row.selected)
    .map(row => ({
      booking_id: booking.id,
      booking_no: booking.booking_no,
      booking_breakup_id: row.booking_breakup_id,
      breakup_type: row.breakup_type,
      container_no: row.container_no,
    }));
    
  state.breakupRows = [...state.breakupRows, ...newBreakups];
  
  console.log('[TRACE] executeBookingLink() AFTER - Header:', JSON.stringify(state.currentJobCard));
  console.log('[TRACE] executeBookingLink() AFTER - Breakups:', JSON.stringify(state.breakupRows));
}

function simulateUserSelectBreakups(ids) {
  state.allocationSelectionRows.forEach(row => {
    if (ids.includes(row.booking_breakup_id)) row.selected = true;
  });
}

function runSimulation() {
  console.log('--- SIMULATION START ---');
  openCreateDialog();
  
  // Link Booking 1
  const booking1 = {
    id: 1, booking_no: 'BK001', department: 'OPS', service_type: 'OF',
    booking_breakup: [{ id: 101, container_no: 'CONT1' }, { id: 102, container_no: 'CONT2' }]
  };
  buildAllocationSelectionRows(booking1);
  simulateUserSelectBreakups([101]); // User selects CONT1 only
  executeBookingLink(booking1);
  
  // Link Booking 2 (Append)
  const booking2 = {
    id: 2, booking_no: 'BK002', department: 'OPS', service_type: 'OF',
    booking_breakup: [{ id: 201, container_no: 'CONT3' }, { id: 202, container_no: 'CONT4' }]
  };
  buildAllocationSelectionRows(booking2);
  simulateUserSelectBreakups([201, 202]); // User selects CONT3, CONT4
  executeBookingLink(booking2);
  
  // Save Job
  console.log('[TRACE] save payload:', JSON.stringify(state));
  
  // Create New Job
  console.log('--- CREATE SECOND JOB ---');
  openCreateDialog();
  console.log('[TRACE] State after second openCreateDialog:', JSON.stringify(state));
}

runSimulation();
