import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { CalendarModule } from 'primeng/calendar';
import { MasterUOMService, MasterUOM } from '../../services/master-uom.service';
import { MasterTypeService } from '../../services/mastertype.service';

@Component({
  selector: 'master-uom',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DropdownModule,
    ToastModule,
    DialogModule,
    CalendarModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Master UOM</div>

      <p-table
        #dt
        [value]="uoms"
        dataKey="code"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['uom_type', 'code', 'description', 'start_day', 'end_day', 'working_days']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add UOM" icon="pi pi-plus" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <span class="ml-auto">
              <input pInputText type="text" (input)="onGlobalFilter($event, dt)" placeholder="Search keyword" />
            </span>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th>
              <div class="flex justify-between items-center">
                UOM Type
                <p-columnFilter type="text" field="uom_type" display="menu" placeholder="Search by type"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Code
                <p-columnFilter type="text" field="code" display="menu" placeholder="Search by code"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Description
                <p-columnFilter type="text" field="description" display="menu" placeholder="Search by description"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Start Day
                <p-columnFilter type="text" field="start_day" display="menu" placeholder="Search by start day"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                End Day
                <p-columnFilter type="text" field="end_day" display="menu" placeholder="Search by end day"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Working Days
                <p-columnFilter type="text" field="working_days" display="menu" placeholder="Search by working days"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Active
                <p-columnFilter field="active" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="activeOptions"
                      (onChange)="filter($event.value)"
                      placeholder="Any"
                      styleClass="w-full"
                      optionLabel="label"
                      optionValue="value"
                    ></p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-uom>
          <tr>
            <td>{{ uom.uom_type }}</td>
            <td>{{ uom.code }}</td>
            <td>{{ uom.description }}</td>
            <td>{{ uom.start_day }}</td>
            <td>{{ uom.end_day }}</td>
            <td>{{ uom.working_days }}</td>
            <td>
            <span
              class="text-sm font-semibold px-3 py-1 rounded-full"
              [ngClass]="{
                'text-green-700 bg-green-100': uom.active,
                'text-red-700 bg-red-100': !uom.active
              }"
            >
              {{ uom.active ? 'Active' : 'Inactive' }}
            </span>
          </td>

            <td>
              <button pButton type="button" icon="pi pi-pencil" (click)="editRow(uom)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      header="{{ selectedUOM?.isNew ? 'Add' : 'Edit' }} UOM"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '750px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedUOM" class="p-fluid form-grid dialog-body-padding">
          <div class="grid-container">
            <div class="grid-item">
              <label for="uom_type">UOM Type</label>
              <p-dropdown
                id="uom_type"
                [options]="uomTypeOptions"
                [(ngModel)]="selectedUOM.uom_type"
                optionLabel="value"
                optionValue="value"
                placeholder="Select Type"
                [filter]="true"
                [disabled]="!selectedUOM.isNew"
              ></p-dropdown>
            </div>
            <div class="grid-item">
              <label for="code">Code</label>
              <input id="code" pInputText [(ngModel)]="selectedUOM.code" [disabled]="!selectedUOM.isNew" />
            </div>
              <div class="grid-item full-width">
              <label for="description">Description</label>
              <input id="description" pInputText [(ngModel)]="selectedUOM.description" />
            </div>
            <div class="grid-item">
            <label for="start_day">Start Day</label>
            <p-calendar
              id="start_day"
              [(ngModel)]="selectedUOM.start_day"
              dateFormat="yy-mm-dd"
              (onSelect)="calculateWorkingDays()"
              showIcon="true"
            ></p-calendar>
          </div>
           <div class="grid-item">
            <label for="end_day">End Day</label>
            <p-calendar
              id="end_day"
              [(ngModel)]="selectedUOM.end_day"
              dateFormat="yy-mm-dd"
              (onSelect)="calculateWorkingDays()"
              showIcon="true"
            ></p-calendar>
          </div>
        
            <div class="grid-item">
            <label for="working_days">Working Days</label>
            <input id="working_days" pInputText [(ngModel)]="selectedUOM.working_days" disabled />
          </div>
            <div class="grid-item">
              <label for="active">Status</label>
              <p-dropdown
                id="active"
                [options]="activeOptions"
                [(ngModel)]="selectedUOM.active"
                optionLabel="label"
                optionValue="value"
              ></p-dropdown>
            </div>
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="hideDialog()"></button>
          <button pButton label="{{ selectedUOM?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()"></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .grid-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }
    .grid-item {
      display: flex;
      flex-direction: column;
    }
    .full-width {
      grid-column: span 2;
    }
    label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class MasterUOMComponent implements OnInit {
  uoms: MasterUOM[] = [];
  uomTypeOptions: any[] = [];
  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  isDialogVisible = false;
  selectedUOM: (MasterUOM & { isNew?: boolean }) | null = null;

  constructor(
    private masterUOMService: MasterUOMService,
    private masterTypeService: MasterTypeService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.refreshList();
    this.masterTypeService.getAll().subscribe((types: any[]) => {
      this.uomTypeOptions = types.filter(t => t.key === 'UOM' && t.status === 'Active');
    });
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refreshList() {
    this.masterUOMService.getAll().subscribe(data => {
      this.uoms = data;
    });
  }

  addRow() {
    this.selectedUOM = {
      uom_type: '',
      code: '',
      description: '',
      start_day: '',
      end_day: '',
      working_days: '',
      active: true,
      isNew: true,
    };
    this.isDialogVisible = true;
  }

  editRow(uom: MasterUOM) {
    this.selectedUOM = { ...uom, isNew: false };
    this.isDialogVisible = true;
  }

  saveRow() {
    if (!this.selectedUOM) return;
  
    // Format dates before sending
    const formattedUOM = {
      ...this.selectedUOM,
      start_day: this.formatDate(this.selectedUOM.start_day),
      end_day: this.formatDate(this.selectedUOM.end_day)
    };
  
    if (this.selectedUOM.isNew) {
      this.masterUOMService.create(formattedUOM).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'UOM created' });
          this.refreshList();
          this.hideDialog();
        },
        error: () =>
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create UOM' })
      });
    } else {
      if (!this.selectedUOM.id) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Missing UOM ID for update' });
        return;
      }
  
      this.masterUOMService.update(this.selectedUOM.id, formattedUOM).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'UOM updated' });
          this.refreshList();
          this.hideDialog();
        },
        error: () =>
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update UOM' })
      });
    }
  }
  
  hideDialog() {
    this.isDialogVisible = false;
    this.selectedUOM = null;
  }
  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  
  calculateWorkingDays() {
    if (!this.selectedUOM?.start_day || !this.selectedUOM?.end_day) {
      this.selectedUOM!.working_days = '';
      return;
    }
  
    const start = new Date(this.selectedUOM.start_day);
    const end = new Date(this.selectedUOM.end_day);
  
    if (end >= start) {
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both days
      this.selectedUOM!.working_days = diffDays.toString();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Dates',
        detail: 'End date must be after start date'
      });
      this.selectedUOM!.working_days = '';
    }
  }

  clear(table: any) {
    table.clear();
  }
  
}
