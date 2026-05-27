const fs = require('fs');

let tsContent = fs.readFileSync('src/app/pages/Operation/job-card.ts', 'utf8');

// Phase 2: Number Series Alignment
// Change <input pInputText [disabled]="true" [ngModel]="currentJobCard.job_card_no" placeholder="Auto-generated" class="bg-gray-100" />
// to: <input pInputText [disabled]="isEditMode" [(ngModel)]="currentJobCard.job_card_no" placeholder="Auto-generated / Manual Entry" [ngClass]="isEditMode ? 'bg-gray-100' : ''" />

const numberTarget = `[disabled]="true" [ngModel]="currentJobCard.job_card_no" placeholder="Auto-generated" class="bg-gray-100"`;
const numberReplacement = `[disabled]="isEditMode" [(ngModel)]="currentJobCard.job_card_no" placeholder="Auto-generated / Manual Entry" [ngClass]="isEditMode ? 'bg-gray-100' : ''"`;

tsContent = tsContent.replace(numberTarget, numberReplacement);

fs.writeFileSync('src/app/pages/Operation/job-card.ts', tsContent, 'utf8');
console.log('Phase 2 Patch Complete.');
