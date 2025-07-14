import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CompanyService, Company } from '../../../services/company.service';
import { BranchService, Branch } from '../../../services/branch.service';
import { DepartmentService, Department } from '../../../services/department.service';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-company-hierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, InputTextModule, ButtonModule, TabsModule],
  template: `
    <div class="md:w-full">
      <div class="card">
        <div class="font-semibold text-xl mb-4">Company Management</div>
        <p-tabs [value]="tabIndex">
          <p-tablist>
            <p-tab [value]="0">Company</p-tab>
            <p-tab [value]="1">Branches</p-tab>
            <p-tab [value]="2">Departments</p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel [value]="0">
              <!-- Company Section: Add button, company card, full detail dialog -->
              <div class="flex justify-end mb-4">
                <button pButton label="+ Add Company" class="p-button-success" (click)="openCompanyDialog()"></button>
              </div>
              <div *ngIf="company" class="cursor-pointer border rounded-xl shadow-lg hover:shadow-xl transition-all" (click)="openCompanyDialog(company)">
                <div class="bg-blue-600 text-white p-6 rounded-t-xl">
                  <h2 class="text-2xl font-bold uppercase">{{ company.name }}</h2>
                  <p class="text-sm mt-1 italic">{{ company.name2 }}</p>
                  <p class="text-sm mt-2">{{ company.address1 }}, {{ company.address2 }}</p>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 text-sm">
                  <div><strong>GST:</strong> {{ company.gst }}</div>
                  <div><strong>Phone:</strong> {{ company.phone }}</div>
                  <div><strong>Landline:</strong> {{ company.landline }}</div>
                  <div><strong>Email:</strong> {{ company.email }}</div>
                  <div><strong>Website:</strong> {{ company.website }}</div>
                </div>
              </div>
            </p-tabpanel>
            <p-tabpanel [value]="1">
              <!-- Branch Section: Company card (min details), Add Branch, branch cards with dialog -->
              <div *ngIf="company" class="mb-4 border rounded p-4 bg-blue-50">
                <div class="font-bold text-lg">{{ company.name }}</div>
                <div class="text-xs text-gray-500">Code: {{ company.code }}</div>
              </div>
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-semibold">Branches</h3>
                <button pButton label="+ Add Branch" class="p-button-success" (click)="openBranchDialog()"></button>
              </div>
              <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div *ngFor="let branch of branches" class="cursor-pointer border rounded-xl shadow hover:shadow-lg transition-all" (click)="openBranchDialog(branch)">
                  <div class="p-4 bg-green-600 text-white rounded-t-xl">
                    <h3 class="text-xl font-bold uppercase">{{ branch.name }}</h3>
                    <p class="text-sm">{{ branch.address }}</p>
                  </div>
                  <div class="grid grid-cols-2 p-4 gap-2 text-sm bg-white">
                    <div><strong>Code:</strong> {{ branch.code }}</div>
                    <div><strong>GST:</strong> {{ branch.gst }}</div>
                    <div><strong>Incharge:</strong> {{ branch.incharge_name }}</div>
                    <div><strong>Incharge From:</strong> {{ branch.incharge_from }}</div>
                    <div><strong>Status:</strong> {{ branch.status }}</div>
                    <div><strong>Start:</strong> {{ branch.start_date }}</div>
                    <div><strong>Close:</strong> {{ branch.close_date || '-' }}</div>
                    <div class="col-span-2"><strong>Remarks:</strong> {{ branch.remarks }}</div>
                    <div class="col-span-2"><strong>Description:</strong> {{ branch.description }}</div>
                  </div>
                </div>
              </div>
            </p-tabpanel>
            <p-tabpanel [value]="2">
              <!-- Department Section: Company card (min details), branches in full width, Add Department per branch -->
              <div *ngIf="company" class="mb-4 border rounded p-4 bg-blue-50">
                <div class="font-bold text-lg">{{ company.name }}</div>
                <div class="text-xs text-gray-500">Code: {{ company.code }}</div>
              </div>
              <div *ngFor="let branch of branches" class="mb-8">
                <div class="w-full border rounded-xl shadow bg-green-50 p-4 mb-2">
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-bold text-lg">{{ branch.name }}</div>
                      <div class="text-xs text-gray-500">Incharge: {{ branch.incharge_name }}</div>
                    </div>
                    <button pButton icon="pi pi-plus" label="Add Department" class="p-button-sm p-button-success" (click)="openDepartmentDialog(branch)"></button>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div *ngFor="let dept of branch.departments" class="bg-white border rounded-xl p-4 shadow hover:shadow-md transition-all cursor-pointer" (click)="openDepartmentDialog(branch, dept); $event.stopPropagation()">
                    <div class="flex justify-between items-center mb-2">
                      <div class="font-bold text-lg">{{ dept.name }}</div>
                      <div class="text-xs text-gray-500">Code: {{ dept.code }}</div>
                    </div>
                    <div class="text-xs text-gray-600 mb-2">{{ dept.description }}</div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                      <div><strong>Incharge:</strong> {{ dept.incharge_name }}</div>
                      <div><strong>Incharge From:</strong> {{ dept.incharge_from }}</div>
                      <div><strong>Status:</strong> {{ dept.status }}</div>
                      <div><strong>Start:</strong> {{ dept.start_date }}</div>
                      <div><strong>Close:</strong> {{ dept.close_date || '-' }}</div>
                      <div class="col-span-2"><strong>Remarks:</strong> {{ dept.remarks }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
        <!-- Dialogs remain unchanged -->
        <p-dialog header="{{ selectedCompany?.code ? 'Edit' : 'Add' }} Company" [(visible)]="displayCompanyDialog" [modal]="true" [style]="{ width: '700px' }" [closable]="false">
          <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ng-container *ngFor="let field of companyFields">
              <div>
                <label class="block mb-1 font-medium">{{ field.label }}</label>
                <input [type]="field.type" pInputText class="w-full" [(ngModel)]="selectedCompany[field.key]" [name]="field.key" />
              </div>
            </ng-container>
          </form>
          <ng-template pTemplate="footer">
            <div class="text-right">
              <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeCompanyDialog()"></button>
              <button pButton label="Save" class="p-button-primary" type="button" (click)="saveCompany()"></button>
            </div>
          </ng-template>
        </p-dialog>
        <p-dialog header="{{ selectedBranch?.code ? 'Edit' : 'Add' }} Branch" [(visible)]="displayBranchDialog" [modal]="true" [style]="{ width: '700px' }" [closable]="false">
          <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ng-container *ngFor="let field of branchFields">
              <div>
                <label class="block mb-1 font-medium">{{ field.label }}</label>
                <input [type]="field.type" pInputText class="w-full" [(ngModel)]="selectedBranch[field.key]" [name]="field.key" />
              </div>
            </ng-container>
          </form>
          <ng-template pTemplate="footer">
            <div class="text-right">
              <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeBranchDialog()"></button>
              <button pButton label="Save" class="p-button-primary" type="button" (click)="saveBranch()"></button>
            </div>
          </ng-template>
        </p-dialog>
        <p-dialog header="{{ selectedDepartment?.code ? 'Edit' : 'Add' }} Department" [(visible)]="displayDepartmentDialog" [modal]="true" [style]="{ width: '700px' }" [closable]="false">
          <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ng-container *ngFor="let field of departmentFields">
              <div>
                <label class="block mb-1 font-medium">{{ field.label }}</label>
                <input [type]="field.type" pInputText class="w-full" [(ngModel)]="selectedDepartment[field.key]" [name]="field.key" />
              </div>
            </ng-container>
          </form>
          <ng-template pTemplate="footer">
            <div class="text-right">
              <button pButton label="Cancel" class="p-button-secondary mr-2" (click)="closeDepartmentDialog()"></button>
              <button pButton label="Save" class="p-button-primary" type="button" (click)="saveDepartment()"></button>
            </div>
          </ng-template>
        </p-dialog>
      </div>
    </div>
  `
})
export class CompanyManagementComponent implements OnInit {
  tabIndex = 0;
  company: Company | null = null;
  branches: Branch[] = [];

  selectedCompany: Company = {} as Company;
  selectedBranch: Branch = {} as Branch;
  selectedDepartment: Department = {} as Department;
  currentBranchForDepartment: Branch | null = null;

  displayCompanyDialog = false;
  displayBranchDialog = false;
  displayDepartmentDialog = false;

  companyFields = [
    { key: 'code', label: 'Company Code', type: 'text' },
    { key: 'name', label: 'Company Name', type: 'text' },
    { key: 'name2', label: 'Company Name 2', type: 'text' },
    { key: 'gst', label: 'GST No.', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'landline', label: 'Landline', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'website', label: 'Website', type: 'text' },
    { key: 'address1', label: 'Address 1', type: 'text' },
    { key: 'address2', label: 'Address 2', type: 'text' },
  ];

  branchFields = [
    { key: 'company_code', label: 'Company Code', type: 'text' },
    { key: 'code', label: 'Branch Code', type: 'text' },
    { key: 'name', label: 'Branch Name', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'gst', label: 'GST No.', type: 'text' },
    { key: 'incharge_name', label: 'Incharge Name & Contact No.', type: 'text' },
    { key: 'incharge_from', label: 'Incharge From Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'start_date', label: 'Start Date', type: 'date' },
    { key: 'close_date', label: 'Close Date', type: 'date' },
    { key: 'remarks', label: 'Remarks', type: 'text' },
  ];

  departmentFields = [
    { key: 'company_code', label: 'Company Code', type: 'text' },
    { key: 'branch_code', label: 'Branch Code', type: 'text' },
    { key: 'code', label: 'Department Code', type: 'text' },
    { key: 'name', label: 'Department Name', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'incharge_name', label: 'Incharge Name & Contact No.', type: 'text' },
    { key: 'incharge_from', label: 'Incharge From Date', type: 'date' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'start_date', label: 'Start Date', type: 'date' },
    { key: 'close_date', label: 'Close Date', type: 'date' },
    { key: 'remarks', label: 'Remarks', type: 'text' },
  ];

  constructor(
    private companyService: CompanyService,
    private branchService: BranchService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    this.loadCompanies();
    this.loadBranches();
  }

  loadCompanies() {
    this.companyService.getAll().subscribe({
      next: (companies) => {
        if (companies.length > 0) {
          this.company = companies[0];
        }
      },
      error: (error) => {
        console.error('Error loading companies:', error);
      }
    });
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: (branches) => {
        this.branches = branches.map(branch => ({
          ...branch,
          departments: []
        }));
        this.loadDepartmentsForBranches();
      },
      error: (error) => {
        console.error('Error loading branches:', error);
      }
    });
  }

  loadDepartmentsForBranches() {
    this.departmentService.getAll().subscribe({
      next: (departments) => {
        departments.forEach(dept => {
          const branch = this.branches.find(b => b.code === dept.branch_code);
          if (branch) {
            if (!branch.departments) {
              branch.departments = [];
            }
            branch.departments.push(dept);
          }
        });
      },
      error: (error) => {
        console.error('Error loading departments:', error);
      }
    });
  }

  openCompanyDialog(data: Company | null = null) {
    this.selectedCompany = data ? { ...data } : {} as Company;
    this.displayCompanyDialog = true;
  }

  closeCompanyDialog() {
    this.displayCompanyDialog = false;
    this.selectedCompany = {} as Company;
  }

  saveCompany() {
    if (!this.selectedCompany) return;
    if (typeof this.selectedCompany.code === 'string') {
      this.selectedCompany.code = this.selectedCompany.code.trim();
    }
    console.log('Saving company:', this.selectedCompany);

    // Check if the code exists in the loaded companies
    const codeExists = this.company && this.company.code === this.selectedCompany.code;

    if (!codeExists) {
      this.companyService.create(this.selectedCompany).subscribe({
        next: (created) => {
          this.loadCompanies();
          this.closeCompanyDialog();
        },
        error: (err) => {
          console.error('Error creating company:', err);
        }
      });
    } else {
      console.log('Updating company with code:', this.selectedCompany.code, 'Payload:', this.selectedCompany);
      this.companyService.update(this.selectedCompany.code, this.selectedCompany).subscribe({
        next: () => {
          this.loadCompanies();
          this.closeCompanyDialog();
        },
        error: (err) => {
          console.error('Error updating company:', err);
        }
      });
    }
  }

  openBranchDialog(branch: Branch | null = null) {
    this.selectedBranch = branch ? { ...branch } : { company_code: this.company?.code || '' } as Branch;
    this.displayBranchDialog = true;
  }

  closeBranchDialog() {
    this.displayBranchDialog = false;
    this.selectedBranch = {} as Branch;
  }

  saveBranch() {
    if (!this.selectedBranch) return;
    if (typeof this.selectedBranch.code === 'string') {
      this.selectedBranch.code = this.selectedBranch.code.trim();
    }
    console.log('Saving branch:', this.selectedBranch);

    // Check if the code exists in the loaded branches
    const codeExists = this.branches.some(b => b.code === this.selectedBranch.code);

    if (!codeExists) {
      this.branchService.create(this.selectedBranch).subscribe({
        next: (created) => {
          this.loadBranches();
          this.closeBranchDialog();
        },
        error: (err) => {
          console.error('Error creating branch:', err);
        }
      });
    } else {
      console.log('Updating branch with code:', this.selectedBranch.code, 'Payload:', this.selectedBranch);
      this.branchService.update(this.selectedBranch.code, this.selectedBranch).subscribe({
        next: () => {
          this.loadBranches();
          this.closeBranchDialog();
        },
        error: (err) => {
          console.error('Error updating branch:', err);
        }
      });
    }
  }

  openDepartmentDialog(branch: Branch, department: Department | null = null) {
    this.currentBranchForDepartment = branch;
    this.selectedDepartment = department
      ? { ...department }
      : { company_code: branch.company_code, branch_code: branch.code } as Department;
    this.displayDepartmentDialog = true;
  }

  closeDepartmentDialog() {
    this.displayDepartmentDialog = false;
    this.selectedDepartment = {} as Department;
  }

  saveDepartment() {
    if (!this.selectedDepartment) return;
    if (typeof this.selectedDepartment.code === 'string') {
      this.selectedDepartment.code = this.selectedDepartment.code.trim();
    }
    console.log('Saving department:', this.selectedDepartment);

    // Find the current branch's departments
    const departments = this.currentBranchForDepartment?.departments || [];
    const codeExists = departments.some(d => d.code === this.selectedDepartment.code);

    if (!codeExists) {
      this.departmentService.create(this.selectedDepartment).subscribe({
        next: (created) => {
          this.loadDepartmentsForBranches();
          this.closeDepartmentDialog();
        },
        error: (err) => {
          console.error('Error creating department:', err);
        }
      });
    } else {
      console.log('Updating department with code:', this.selectedDepartment.code, 'Payload:', this.selectedDepartment);
      this.departmentService.update(this.selectedDepartment.code, this.selectedDepartment).subscribe({
        next: () => {
          this.loadDepartmentsForBranches();
          this.closeDepartmentDialog();
        },
        error: (err) => {
          console.error('Error updating department:', err);
        }
      });
    }
  }
}
