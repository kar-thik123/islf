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
        [globalFilterFields]="['numberSeries', 'startingDate', 'prefix', 'startingNo', 'endingNo', 'lastNoUsed', 'incrementBy']"
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
            <td>{{ rel.lastNoUsed }}</td>
            <td>{{ rel.incrementBy }}</td>
            <td>
            <div class="flex items-center space-x-[8px]">
              <button
                pButton
                icon="pi pi-pencil"
                class="p-button-sm"
                (click)="editRow(rel)"
                [disabled]="rel.lastNoUsed > 0"
                title="Edit"
              ></button>
              <button
                pButton
                icon="pi pi-trash"
                class="p-button-sm"
                severity="danger"
                (click)="deleteRow(rel)"
                [disabled]="rel.lastNoUsed > 0"
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
            <input id="endingNo" type="number" pInputText [(ngModel)]="selectedRow.endingNo" />
          </div>
          <div class="grid-item">
            <label for="prefix">Prefix</label>
            <input id="prefix" type="text" pInputText [(ngModel)]="selectedRow.prefix" />
          </div>
          <div class="grid-item ">
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
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }
    .grid-item {
      display: flex;
      flex-direction: column;
    }
    .full-width {
      grid-column: span 2;
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
      lastNoUsed: 0,
      incrementBy: 1
    };
    this.displayDialog = true;
  }

  editRow(row: NumberSeriesRelation) {
    console.log('Editing row:', row);
    this.selectedRow = { ...row };
    this.displayDialog = true;
  }

  deleteRow(row: NumberSeriesRelation) {
    if (row.id) {
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
}
