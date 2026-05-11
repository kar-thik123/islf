import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContextService, UserContext } from '../services/context.service';
import { Subscription } from 'rxjs';

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
      [style]="{ width: 'auto', minWidth: '300px', maxWidth: '90vw' }"
      (onHide)="onDialogHide()"
    >
      <div class="p-fluid p-3 space-y-3">
        <div *ngIf="isBypass || ((contextService.companyOptions$ | async)?.length !== 1)">
          <label for="company" class="block mb-2 font-medium">Company</label>
          <p-dropdown
            id="company"
            [options]="(contextService.companyOptions$ | async) || []"
            [(ngModel)]="selectedCompany"
            (onChange)="onCompanyChange()"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Company"
            [showClear]="true"
          ></p-dropdown>
        </div>

        <div *ngIf="isBypass || ((contextService.branchOptions$ | async)?.length !== 1)">
          <label for="branch" class="block mb-2 font-medium">Branch</label>
          <p-dropdown
            id="branch"
            [options]="(contextService.branchOptions$ | async) || []"
            [(ngModel)]="selectedBranch"
            (onChange)="onBranchChange()"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Branch"
            [showClear]="true"
          ></p-dropdown>
        </div>

        <div *ngIf="isBypass || ((contextService.departmentOptions$ | async)?.length !== 1)">
          <label for="department" class="block mb-2 font-medium">Department</label>
          <p-dropdown
            id="department"
            [options]="(contextService.departmentOptions$ | async) || []"
            [(ngModel)]="selectedDepartment"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Department"
            [showClear]="true"
          ></p-dropdown>
        </div>

        <div>
          <!--<label for="serviceType" class="block mb-2 font-medium">Service Type</label>
          <p-dropdown
            id="serviceType"
            [options]="(contextService.serviceTypeOptions$ | async) || []"
            [(ngModel)]="selectedServiceType"
            optionLabel="label"
            optionValue="value"
            placeholder="Select Service Type"
            [showClear]="true"
            [disabled]="true"
          ></p-dropdown>
          -->
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
export class ContextSelectorComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() contextSet = new EventEmitter<UserContext>();
  
  selectedCompany?: string;
  selectedBranch?: string;
  selectedDepartment?: string;
  selectedServiceType?: string;
  isBypass: boolean = true;

  private subscriptions: Subscription[] = [];
 
  constructor(public contextService: ContextService) {}
 
  ngOnInit() {
    this.isBypass = this.contextService.isBypassRolePublic();
    // Initialize context values if already set
    this.initializeContextValues();
    this.setupAutoSelection();
  }
  
  ngOnChanges(changes: SimpleChanges) {
    // Re-initialize context values when visibility changes
    if (changes['visible'] && changes['visible'].currentValue === true) {
      this.initializeContextValues();
      // Reload all options when dialog opens to show newly added values
      this.reloadAllOptions();
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  setupAutoSelection() {
    // Auto-select company if only one option
    const companySub = this.contextService.companyOptions$.subscribe(options => {
      if (!this.isBypass && options && options.length === 1 && !this.selectedCompany) {
        this.selectedCompany = options[0].value;
        this.onCompanyChange();
        this.checkAndAutoSave();
      }
    });

    // Auto-select branch if only one option
    const branchSub = this.contextService.branchOptions$.subscribe(options => {
      if (!this.isBypass && options && options.length === 1 && !this.selectedBranch && this.selectedCompany) {
        this.selectedBranch = options[0].value;
        this.onBranchChange();
        this.checkAndAutoSave();
      }
    });

    // Auto-select department if only one option
    const departmentSub = this.contextService.departmentOptions$.subscribe(options => {
      if (!this.isBypass && options && options.length === 1 && !this.selectedDepartment && this.selectedBranch) {
        this.selectedDepartment = options[0].value;
        this.onDepartmentChange();
        this.checkAndAutoSave();
      }
    });

    // Auto-select service type if only one option
    const serviceTypeSub = this.contextService.serviceTypeOptions$.subscribe(options => {
      if (!this.isBypass && options && options.length === 1 && !this.selectedServiceType && this.selectedDepartment) {
        this.selectedServiceType = options[0].value;
      }
    });

    this.subscriptions.push(companySub, branchSub, departmentSub, serviceTypeSub);
  }
  
  initializeContextValues() {
    const context = this.contextService.getContext();
    this.selectedCompany = context.companyCode;
    this.selectedBranch = context.branchCode;
    this.selectedDepartment = context.departmentCode;
    this.selectedServiceType = context.serviceType || undefined;
  }
 
  onCompanyChange() {
    this.selectedBranch = undefined;
    this.selectedDepartment = undefined;
    this.selectedServiceType = undefined;
    this.contextService.clearBranchOptions();
    this.contextService.clearDepartmentOptions();
    this.contextService.clearServiceTypeOptions();
    
    if (this.selectedCompany) {
      this.contextService.loadBranchesForCompany(this.selectedCompany);
    }
  }
 
  onBranchChange() {
    this.selectedDepartment = undefined;
    this.selectedServiceType = undefined;
    this.contextService.clearDepartmentOptions();
    this.contextService.clearServiceTypeOptions();
    
    if (this.selectedBranch) {
      this.contextService.loadDepartmentsForBranch(this.selectedBranch);
    }
  }

  onDepartmentChange() {
    this.selectedServiceType = undefined;
    this.contextService.clearServiceTypeOptions();
    
    if (this.selectedDepartment) {
      this.contextService.loadServiceTypesForDepartment(this.selectedDepartment);
      this.checkAndAutoSave();
    }
  }

  checkAndAutoSave() {
    if (!this.isBypass && this.selectedCompany && this.selectedBranch && this.selectedDepartment) {
      setTimeout(() => {
        if (this.canSave()) {
          this.saveContext();
        }
      });
    }
  }
 
  canSave(): boolean {
    return !!this.selectedCompany;
  }
 
  saveContext(): void {
    if (!this.selectedCompany) {
      return;
    }
    
    const ctx: UserContext = {
      companyCode: this.selectedCompany,
      branchCode: this.selectedBranch,
      departmentCode: this.selectedDepartment,
      serviceType: this.selectedServiceType || null
    };
    console.log('Saving context in selector:', ctx);
    
    this.contextService.setContext(ctx);
    this.contextSet.emit(ctx);
    this.visible = false;
    this.visibleChange.emit(false);
  }
  
  onDialogHide() {
    this.visibleChange.emit(false);
  }

  private reloadAllOptions() {
    // Reload all context options to show newly added values
    this.contextService.loadOptions();
  }
}
