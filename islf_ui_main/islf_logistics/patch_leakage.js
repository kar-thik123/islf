const fs = require('fs');

let tsContent = fs.readFileSync('src/app/pages/Operation/job-card.ts', 'utf8');

// Fix 1: bookingToJobAdapter - filter by !row.disabled as well
const adapterTarget = `.filter((row: any) => row.selected)`;
const adapterReplacement = `.filter((row: any) => row.selected && !row.disabled)`;
tsContent = tsContent.replace(adapterTarget, adapterReplacement);

// Fix 2: buildAllocationSelectionRows - don't select rows allocated to other jobs
const selectedTarget = `selected: isAllocated ? true : false,`;
const selectedReplacement = `selected: isAllocated && isAllocated.job_card_id === this.currentJobCard.id ? true : false,`;

// We have 3 instances of selectedTarget in buildAllocationSelectionRows
tsContent = tsContent.split(selectedTarget).join(selectedReplacement);

fs.writeFileSync('src/app/pages/Operation/job-card.ts', tsContent, 'utf8');
console.log('Breakup Leakage Patch Complete.');
