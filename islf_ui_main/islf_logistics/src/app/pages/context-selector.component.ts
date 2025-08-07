import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContextService, UserContext } from '../services/context.service';

@Component({
  selector: 'app-context-selector',
  standalone: true,
  imports: [DialogModule, DropdownModule, ButtonModule, FormsModule, CommonModule],
  template: `
    <p-dialog
      header="Select Context"
      [(visible)]="visible"
      [modal]="true"
      [closable]="false"
      [dismissableMask]="false"
      [style]="{ width: '400px' }"
    >
      <div class="p-fluid p-3 space-y-3">
        <div>
          <label for="company" class="block mb-2 font-medium">Company</label>
          <p-dropdown
            id="company"
            [options]="contextService.companyOptions$ | async"
            [(ngModel)]="selectedCompany"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Company"
            [showClear]="true"
          ></p-dropdown>
        </div>

        <div>
          <label for="branch" class="block mb-2 font-medium">Branch</label>
          <p-dropdown
            id="branch"
            [options]="contextService.branchOptions$ | async"
            [(ngModel)]="selectedBranch"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Branch"
            [showClear]="true"
          ></p-dropdown>
        </div>

        <div>
          <label for="department" class="block mb-2 font-medium">Department</label>
          <p-dropdown
            id="department"
            [options]="contextService.departmentOptions$ | async"
            [(ngModel)]="selectedDepartment"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Department"
            [showClear]="true"
          ></p-dropdown>
        </div>

        <div class="text-right pt-3">
          <button
            pButton
            type="button"
            label="Save"
            icon="pi pi-check"
            class="p-button-primary"
            (click)="saveContext()"
            [disabled]="!canSave()"
          ></button>
        </div>
      </div>
    </p-dialog>
  `
})
export class ContextSelectorComponent {
  visible = true;
  selectedCompany?: string;
  selectedBranch?: string;
  selectedDepartment?: string;

  constructor(public contextService: ContextService) {}

  canSave(): boolean {
    return !!(this.selectedCompany && this.selectedBranch && this.selectedDepartment);
  }

  saveContext(): void {
    const ctx: UserContext = {
      companyCode: this.selectedCompany!,
      branchCode: this.selectedBranch!,
      departmentCode: this.selectedDepartment!
    };
    this.contextService.setContext(ctx);
    this.visible = false;
    // Optionally emit an event if needed
  }
}
