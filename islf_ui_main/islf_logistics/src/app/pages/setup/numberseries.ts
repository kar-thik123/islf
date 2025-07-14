import { Component, signal, computed, OnInit, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { NumberSeriesService, NumberSeries as NumberSeriesModel } from '@/services/number-series.service';
import { AppLayout } from '@/layout/components/app.layout';
import { Table } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

interface NumberSeries {
  id?: number;
  code?: string;
  description?: string;
  basecode?: string;
  isDefault?: boolean;
  isManual?: boolean;
  isPrimary?: boolean;
  isEditing?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-number-series',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <p-toolbar>
        <ng-template pTemplate="start">
          <button pButton label="Back" icon="pi pi-arrow-left" (click)="goBack()" class="mr-2"></button>
          <button pButton label="New" icon="pi pi-plus" (click)="addRow()"></button>
        </ng-template>
        <ng-template pTemplate="end">
          <div class="flex align-items-center gap-2">
            <p-iconfield>
              <p-inputicon styleClass="pi pi-search" />
              <input pInputText type="text" (input)="onGlobalFilter(dt, $event)" placeholder="Search..." />
            </p-iconfield>
          </div>
        </ng-template>
      </p-toolbar>
      <p-table
        #dt
        [value]="seriesList()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20]"
        [globalFilterFields]="filterFields"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} series"
        [rowHover]="true"
        [responsiveLayout]="'scroll'"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="code">Code <p-sortIcon field="code" /></th>
            <th pSortableColumn="description">Description <p-sortIcon field="description" /></th>
            <th pSortableColumn="basecode">Basecode <p-sortIcon field="basecode" /></th>
            <th pSortableColumn="isDefault">Default <p-sortIcon field="isDefault" /></th>
            <th pSortableColumn="isManual">Manual <p-sortIcon field="isManual" /></th>
            <th pSortableColumn="isPrimary">Primary <p-sortIcon field="isPrimary" /></th>
            <th>Actions</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-ser>
          <tr>
            <td>
              <ng-container *ngIf="ser.isEditing; else codeText">
                <input pInputText [(ngModel)]="ser.code" />
              </ng-container>
              <ng-template #codeText>{{ ser.code }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="ser.isEditing; else descText">
                <input pInputText [(ngModel)]="ser.description" />
              </ng-container>
              <ng-template #descText>{{ ser.description }}</ng-template>
            </td>
            <td>
              <ng-container *ngIf="ser.isEditing; else baseText">
                <input pInputText [(ngModel)]="ser.basecode" />
              </ng-container>
              <ng-template #baseText>{{ ser.basecode }}</ng-template>
            </td>
            <td>
              <p-checkbox [(ngModel)]="ser.isDefault" binary="true" [disabled]="!ser.isEditing"></p-checkbox>
            </td>
            <td>
              <p-checkbox [(ngModel)]="ser.isManual" binary="true" [disabled]="!ser.isEditing"></p-checkbox>
            </td>
            <td>
              <p-checkbox [(ngModel)]="ser.isPrimary" binary="true" [disabled]="!ser.isEditing"></p-checkbox>
            </td>
            <td>
              <ng-container *ngIf="ser.isEditing">
                <button pButton icon="pi pi-check" (click)="saveRow(ser)" class="mr-2"></button>
              </ng-container>
              <ng-container *ngIf="!ser.isEditing">
                <button pButton icon="pi pi-pencil" (click)="editRow(ser)" class="mr-2"></button>
              </ng-container>
              <button pButton icon="pi pi-trash" severity="danger" (click)="deleteRow(ser)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="paginatorleft" let-state>
          <div class="text-sm text-gray-600">
            Total Series: {{ state.totalRecords }}
          </div>
        </ng-template>
      </p-table>
    </div>
  `
})
export class NumberSeriesComponent implements OnInit {
  seriesList = signal<NumberSeries[]>([]);
  searchTerm = '';
  filterFields: string[] = ['code', 'description', 'basecode'];
  @ViewChild('dt') dt!: Table;

  constructor(
    private messageService: MessageService,
    private location: Location,
    private numberSeriesService: NumberSeriesService
  ) {}

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.numberSeriesService.getAll().subscribe(data => {
      this.seriesList.set(
        data.map(item => ({
          ...item,
          isDefault: item.is_default,
          isManual: item.is_manual,
          isPrimary: item.is_primary
        }))
      );
    });
  }

  goBack() {
    this.location.back();
  }

  addRow() {
    const newRow: NumberSeries = {
      code: '',
      description: '',
      basecode: '',
      isDefault: false,
      isManual: false,
      isPrimary: false,
      isEditing: true,
      isNew: true
    };
    this.seriesList.set([...this.seriesList(), newRow]);
  }

  saveRow(row: NumberSeries) {
    if (row.isNew) {
      this.numberSeriesService.create({
        code: row.code!,
        description: row.description!,
        basecode: row.basecode!,
        is_default: row.isDefault!,
        is_manual: row.isManual!,
        is_primary: row.isPrimary!
      }).subscribe({
        next: (created) => {
          row.id = created.id;
          row.isNew = false;
          row.isEditing = false;
          this.refreshList();
          this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Row saved' });
        }
      });
    } else {
      if (!row.id || isNaN(Number(row.id))) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Row has no valid ID!' });
        return;
      }
      this.numberSeriesService.update(Number(row.id), {
        code: row.code!,
        description: row.description!,
        basecode: row.basecode!,
        is_default: row.isDefault!,
        is_manual: row.isManual!,
        is_primary: row.isPrimary!
      }).subscribe({
        next: () => {
          row.isEditing = false;
          this.refreshList();
          this.messageService.add({ severity: 'success', summary: 'Updated', detail: 'Row updated' });
        }
      });
    }
  }

  editRow(row: NumberSeries) {
    console.log('Editing row:', row);
    const updatedList = this.seriesList().map(r => {
      if (r === row) {
        return { ...r, isEditing: true };
      }
      return r;
    });
    this.seriesList.set(updatedList);
  }
  

  deleteRow(row: NumberSeries) {
    console.log('Deleting row:', row);
    if (row.id && !row.isNew && !isNaN(Number(row.id))) {
      this.numberSeriesService.delete(Number(row.id)).subscribe({
        next: () => {
          this.refreshList();
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Row deleted' });
        }
      });
    } else {
      this.seriesList.set(this.seriesList().filter(r => r !== row));
    }
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  filteredList = computed(() => {
    return this.seriesList().filter(item => {
      return (
        !this.searchTerm ||
        item.code?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.basecode?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    });
  });

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
