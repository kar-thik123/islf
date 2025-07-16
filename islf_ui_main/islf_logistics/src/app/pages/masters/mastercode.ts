import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { Router } from '@angular/router';
import { MasterCodeService } from '../../services/mastercode.service';

@Component({
  selector: 'master-code',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    IconField,
    InputIcon,
    FormsModule,
    DropdownModule,
    InputSwitchModule
  ],
  template: `
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Master Data</h2>
        <button pButton type="button" label="Add Master" icon="pi pi-plus" class="p-button-sm" (click)="addNewMasterRow()"></button>
      </div>

      <p-table
        #dt
        [value]="masters"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5,10,20,50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'description', 'reference', 'status']"
        responsiveLayout="scroll"
      >
        <ng-template #caption>
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <p-iconfield iconPosition="left" class="ml-auto">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
            </p-iconfield>
          </div>
        </ng-template>

        <ng-template #header>
          <tr>
            <th>Code</th>
            <th>Description</th>
            <th>Reference</th>
            <th>Status</th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>

        <ng-template #body let-master let-i="rowIndex">
          <tr>
            <td>
              <input *ngIf="master.isNew" type="text" pInputText [(ngModel)]="master.code" placeholder="Enter code" />
              <span *ngIf="!master.isNew">{{ master.code }}</span>
            </td>
            <td>
              <input *ngIf="master.isNew" type="text" pInputText [(ngModel)]="master.description" placeholder="Enter description" />
              <span *ngIf="!master.isNew">{{ master.description }}</span>
            </td>
            <td>
              <input *ngIf="master.isNew" type="text" pInputText [(ngModel)]="master.reference" placeholder="Enter reference" />
              <span *ngIf="!master.isNew">{{ master.reference }}</span>
            </td>
            <td>
              <p-dropdown
                *ngIf="master.isNew"
                [(ngModel)]="master.status"
                [options]="statuses"
                placeholder="Select status"
                optionLabel="label"
                styleClass="w-full"
              ></p-dropdown>
              <p-inputSwitch
                *ngIf="!master.isNew"
                [(ngModel)]="master.status"
                [trueValue]="'Active'"
                [falseValue]="'Inactive'"
                (onChange)="toggleStatus(master)"
              ></p-inputSwitch>
            </td>
            <td>
              <button
                *ngIf="master.isNew"
                pButton icon="pi pi-check"
                class="p-button-sm p-button-success p-button-text"
                (click)="saveNewMaster(master, i)"
                title="Save"
              ></button>
              <button
                *ngIf="master.isNew"
                pButton icon="pi pi-times"
                class="p-button-sm p-button-danger p-button-text"
                (click)="cancelNewMaster(i)"
                title="Cancel"
              ></button>
              <button
                *ngIf="!master.isNew"
                pButton icon="pi pi-pencil"
                class="p-button-sm p-button-text"
                (click)="editMaster(master)"
                title="Edit"
              ></button>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Entries: {{ state.totalRecords }}
          </div>
        </ng-template>

      </p-table>
    </div>
  `
})
export class MasterCodeComponent implements OnInit {
  masters: any[] = [];
  statuses = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ];

  constructor(private router: Router, private masterService: MasterCodeService) {}

  ngOnInit() {
    this.masterService.getMasters().subscribe((res: any) => {
      this.masters = res.masters || [];
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  addNewMasterRow() {
    const newRow = {
      id: null,
      code: '',
      description: '',
      reference: '',
      status: 'Active',
      isNew: true
    };
    this.masters = [newRow, ...this.masters];
  }

  saveNewMaster(master: any, index: number) {
    this.masterService.createMaster(master).subscribe({
      next: (res) => {
        this.masters[index] = { ...res.master, isNew: false };
      },
      error: (err) => {
        console.error('Failed to save master', err);
      }
    });
  }

  cancelNewMaster(index: number) {
    this.masters.splice(index, 1);
  }

  editMaster(master: any) {
    if (master?.id) {
      this.router.navigate(['setup/create_master', master.id]);
    }
  }

  toggleStatus(master: any) {
    console.log(`Status changed for ${master.code}: ${master.status}`);
    this.masterService.updateMasterStatus(master.id, master.status).subscribe({
      next: () => console.log('Status updated successfully'),
      error: (err: any) => console.error('Failed to update status', err)
    });
  }
}
