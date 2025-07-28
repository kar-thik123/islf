import { Component, signal, computed, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { NumberSeriesRelationService, NumberSeriesRelation } from '@/services/number-series-relation.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-number-series-relation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    ToastModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputSwitchModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="card">
    <div class="font-semibold text-xl mb-4">Number Series Relationship </div>
      <!-- ✅ Add Relation button and Clear button -->
      <p-table
        #dt
        [value]="relationList()"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['numberSeries', 'startingDate', 'prefix', 'startingNo', 'endingNo', 'endingDate', 'status', 'lastNoUsed', 'incrementBy']"
        responsiveLayout="scroll"
      >
        <!-- 🔍 Global Filter + Clear -->
        <ng-template #caption>
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Relation" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
            <button pButton label="Clear" class="p-button-outlined" icon="pi pi-filter-slash" (click)="clear(dt)"></button>
            <p-iconfield iconPosition="left" class="ml-auto">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search keyword" />
            </p-iconfield>
          </div>
        </ng-template>

        <!-- 🧾 Table Headers with Filters -->
        <ng-template #header>
          <tr>
            <th>
              <div class="flex justify-between items-center">
                Numberseries
                <p-columnFilter type="text" field="numberSeries" display="menu" placeholder="Search by series"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Starting Date
                <p-columnFilter type="date" field="startingDate" display="menu" placeholder="YYYY-MM-DD"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Prefix
                <p-columnFilter type="text" field="prefix" display="menu" placeholder="Search by prefix"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Starting No
                <p-columnFilter type="numeric" field="startingNo" display="menu" placeholder="Search by starting no"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Ending No
                <p-columnFilter type="numeric" field="endingNo" display="menu" placeholder="Search by ending no"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Ending Date
                <p-columnFilter type="date" field="endingDate" display="menu" placeholder="YYYY-MM-DD"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Status
                <p-columnFilter type="text" field="status" display="menu" placeholder="Search by status"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Last No Used
                <p-columnFilter type="numeric" field="lastNoUsed" display="menu" placeholder="Search by last no used"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Increment By
                <p-columnFilter type="numeric" field="incrementBy" display="menu" placeholder="Search by increment"></p-columnFilter>
              </div>
            </th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>

        <!-- 👤 Table Body -->
        <ng-template #body let-rel>
          <tr>
            <td>{{ rel.numberSeries }}</td>
            <td>{{ rel.startingDate | date: 'yyyy-MM-dd' }}</td>
            <td>{{ rel.prefix }}</td>
            <td>{{ rel.startingNo }}</td>
            <td>{{ rel.endingNo }}</td>
            <td>{{ rel.endingDate | date: 'yyyy-MM-dd HH:mm:ss' }}</td>
            <td>
              <span *ngIf="rel.endingDate" 
                    [class]="isExpired(rel) ? 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800' : 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'">
                {{ getExpirationStatus(rel) }}
              </span>
              <span *ngIf="!rel.endingDate" class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                No End Date
              </span>
            </td>
            <td>{{ rel.lastNoUsed }}</td>
            <td>{{ rel.incrementBy }}</td>
            <td>
            <div class="flex items-center space-x-[8px]">
              <button
                pButton
                icon="pi pi-pencil"
                class="p-button-sm"
                (click)="editRow(rel)"
                [disabled]="rel.lastNoUsed > 0 || (rel.endingDate && isExpired(rel))"
                title="Edit"
              ></button>
              <button
                pButton
                icon="pi pi-trash"
                class="p-button-sm"
                severity="danger"
                (click)="deleteRow(rel)"
                [disabled]="rel.lastNoUsed > 0 || (rel.endingDate && isExpired(rel))"
                title="Delete"
              ></button>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- 📊 Total Relations Count -->
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Relations: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
    <!-- Dialog Box -->
    <p-dialog
      header="Number Series Details"
      [(visible)]="displayDialog"
      [modal]="true"
      [style]="{ width: '750px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
    >
      <div *ngIf="selectedRow" class="p-fluid form-grid dialog-body-padding">
        <!-- Helpful note about mutual exclusivity -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-sm text-blue-800">
            <i class="pi pi-info-circle mr-2"></i>
            <strong>Note:</strong> Only one of "Ending Number" or "Ending Date" should be filled. 
            If you set an ending date, the ending number will be cleared automatically.
          </p>
        </div>
        
        <div class="grid-container">
          <div class="grid-item">
            <label for="numberSeries">Number Series</label>
            <p-dropdown
              appendTo="body"
              [options]="numberSeriesCodes"
              [(ngModel)]="selectedRow.numberSeries"
              [editable]="false"
              placeholder="Select Number Series"
              [showClear]="true"
              [filter]="true"
              optionLabel="label"
              optionValue="value"
              filterBy="value"
            ></p-dropdown>
          </div>
          <div class="grid-item">
            <label for="startingDate">Starting Date</label>
            <p-calendar
              appendTo="body"
              id="startingDate"
              [(ngModel)]="selectedRow.startingDate"
              dateFormat="yy-mm-dd"
              showIcon="true"
            ></p-calendar>
          </div>
          <div class="grid-item">
            <label for="startingNo">Starting No</label>
            <input id="startingNo" type="number" pInputText [(ngModel)]="selectedRow.startingNo" />
          </div>
          <div class="grid-item">
            <label for="endingNo">Ending No</label>
            <input id="endingNo" type="number" pInputText [(ngModel)]="selectedRow.endingNo" (input)="onEndingNoChange()" />
          </div>
          <div class="grid-item">
            <label for="prefix">Prefix</label>
            <input id="prefix" type="text" pInputText [(ngModel)]="selectedRow.prefix" />
          </div>
          <div class="grid-item">
            <label for="endingDate">Ending Date</label>
            <p-calendar
              appendTo="body"
              id="endingDate"
              [(ngModel)]="selectedRow.endingDate"
              dateFormat="yy-mm-dd"
              showIcon="true"
              [showTime]="true"
              hourFormat="24"
              [keepInvalid]="false"
              (onSelect)="onEndingDateChange()"
              (onInput)="onEndingDateInput($event)"
            ></p-calendar>
            <!-- Warning for past/current ending date -->
            <div *ngIf="selectedRow.endingDate && isEndingDateInvalid()" class="mt-1 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              <i class="pi pi-exclamation-triangle mr-1"></i>
              Warning: This ending date is in the past or present. Please set a future date and time.
            </div>
          </div>
          <div class="grid-item">
            <label for="incrementBy">Increment By</label>
            <input id="incrementBy" type="number" pInputText [(ngModel)]="selectedRow.incrementBy" />
          </div>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button
            pButton
            label="Cancel"
            icon="pi pi-times"
            (click)="closeDialog()"
            class="p-button-outlined p-button-secondary"
          ></button>
          <button
            pButton
            label="Save"
            icon="pi pi-check"
            (click)="saveDialog()"
          ></button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .grid-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    .grid-item {
      display: flex;
      flex-direction: column;
    }
    .full-width {
      grid-column: span 3;
    }
    label {
      margin-bottom: 0.25rem;
      font-weight: 500;
    }
    input, p-calendar {
      width: 100%;
    }
  `]
})
export class NumberSeriesRelationComponent implements OnInit {
  relationList = signal<NumberSeriesRelation[]>([]);
  searchTerm = '';
  displayDialog = false;
  selectedRow: NumberSeriesRelation | null = null;
  numberSeriesCodes: { label: string, value: string }[] = [];
  filterFields: string[] = ['numberSeries', 'prefix'];
  @ViewChild('dt') dt!: Table;

  // Computed property to check if a relation is expired
  isExpired = (relation: NumberSeriesRelation): boolean => {
    if (!relation.endingDate) return false;
    const now = new Date();
    const endingDate = new Date(relation.endingDate);
    return now > endingDate;
  };

  // Get expiration status text
  getExpirationStatus = (relation: NumberSeriesRelation): string => {
    if (!relation.endingDate) return '';
    return this.isExpired(relation) ? 'Expired' : 'Active';
  };

  constructor(
    private messageService: MessageService,
    private location: Location,
    private numberSeriesRelationService: NumberSeriesRelationService
  ) {}

  ngOnInit() {
    this.refreshList();
    this.numberSeriesRelationService.getNumberSeriesCodes().subscribe(codes => {
      this.numberSeriesCodes = codes;
    });
  }

  refreshList() {
    this.numberSeriesRelationService.getAll().subscribe(data => this.relationList.set(data));
  }

  goBack() {
    this.location.back();
  }

  addRow() {
    this.selectedRow = {
      id: 0,
      numberSeries: '',
      startingDate: new Date(),
      prefix: '',
      startingNo: 0,
      endingNo: 0,
      endingDate: undefined,
      lastNoUsed: 0,
      incrementBy: 1
    };
    this.displayDialog = true;
  }

  editRow(row: NumberSeriesRelation) {
    console.log('Editing row:', row);
    
    // Check if relation is expired
    if (row.endingDate && this.isExpired(row)) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Expired Relation', 
        detail: 'This relation has expired and cannot be modified. The ending date has passed.' 
      });
      return;
    }
    
    this.selectedRow = { ...row };
    this.displayDialog = true;
  }

  // Validation methods for mutual exclusivity
  onEndingNoChange() {
    if (this.selectedRow && this.selectedRow.endingNo && this.selectedRow.endingDate) {
      this.selectedRow.endingDate = undefined;
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Validation', 
        detail: 'Ending Date cleared because Ending Number is set. Only one can be specified.' 
      });
    }
  }

  onEndingDateChange() {
    if (this.selectedRow && this.selectedRow.endingDate && this.selectedRow.endingNo) {
      this.selectedRow.endingNo = 0; // Set to 0 instead of null to satisfy database constraint
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Validation', 
        detail: 'Ending Number cleared because Ending Date is set. Only one can be specified.' 
      });
    }
  }

  onEndingDateInput(event: any) {
    // Ensure proper timezone handling
    if (this.selectedRow && this.selectedRow.endingDate) {
      // Convert to local timezone and then to UTC for storage
      const localDate = new Date(this.selectedRow.endingDate);
      const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
      this.selectedRow.endingDate = utcDate;
      
      // Debug logging
      console.log('Original selected time:', localDate.toLocaleString());
      console.log('UTC time for storage:', utcDate.toISOString());
      console.log('Timezone offset (minutes):', localDate.getTimezoneOffset());
    }
  }

  // Debug method to check timezone handling
  debugTimezone(date: Date): void {
    console.log('Original date:', date);
    console.log('Local time:', date.toLocaleString());
    console.log('UTC time:', date.toUTCString());
    console.log('ISO string:', date.toISOString());
    console.log('Timezone offset:', date.getTimezoneOffset(), 'minutes');
  }

  deleteRow(row: NumberSeriesRelation) {
    if (row.id) {
      // Check if relation is expired
      if (row.endingDate && this.isExpired(row)) {
        this.messageService.add({ 
          severity: 'warn', 
          summary: 'Expired Relation', 
          detail: 'This relation has expired and cannot be deleted. The ending date has passed.' 
        });
        return;
      }
      
      this.numberSeriesRelationService.delete(row.id).subscribe({
        next: () => {
          this.refreshList();
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Row deleted' });
        }
      });
    }
  }

  saveDialog() {
    if (!this.selectedRow) return;
    console.log('Saving row:', this.selectedRow);

    // Validate mutual exclusivity
    if (this.selectedRow.endingNo && this.selectedRow.endingDate) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Validation Error', 
        detail: 'Only one of Ending Number or Ending Date can be set, not both.' 
      });
      return;
    }

    // Check if ending date is in the past
    if (this.selectedRow.endingDate) {
      const now = new Date();
      const endingDate = new Date(this.selectedRow.endingDate);
      if (endingDate <= now) {
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Validation Error', 
          detail: 'Ending Date cannot be in the past or present. Please set a future date and time.' 
        });
        return;
      }
    }

    if (!this.selectedRow.id || this.selectedRow.id === 0) {
      const { id, ...payload } = this.selectedRow;
      this.numberSeriesRelationService.create(payload as any).subscribe({
        next: (created) => {
          this.refreshList();
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Row saved' });
          this.closeDialog();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save row' });
          console.error(err);
        }
      });
    } else {
      console.log('Updating row with id:', this.selectedRow.id, 'Payload:', this.selectedRow);
      this.numberSeriesRelationService.update(this.selectedRow.id, this.selectedRow).subscribe({
        next: () => {
          this.refreshList();
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Row updated' });
          this.closeDialog();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update row' });
          console.error(err);
        }
      });
    }
  }

  closeDialog() {
    this.displayDialog = false;
    this.selectedRow = null;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  clear(table: Table) {
    table.clear();
  }

  isEndingDateInvalid(): boolean {
    if (!this.selectedRow || !this.selectedRow.endingDate) {
      return false;
    }
    const now = new Date();
    const endingDate = new Date(this.selectedRow.endingDate);
    return endingDate <= now;
  }
}
