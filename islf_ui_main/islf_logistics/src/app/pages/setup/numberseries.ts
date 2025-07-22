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
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';


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
  has_used_relation?: boolean; // Added for disabling edit/delete
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
    InputIconModule,
    DropdownModule
    // Remove InputSwitchModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    
    <div class="card">
    <div class="font-semibold text-xl mb-4">Number Series  </div>
      <!-- ✅ Add Series button and Clear button -->
      <p-table
        #dt
        [value]="seriesList()"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'description', 'basecode']"
        responsiveLayout="scroll"
      >
        <!-- 🔍 Global Filter + Clear -->
        <ng-template #caption>
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Series" icon="pi pi-plus" class="p-button" (click)="addRow()"></button>
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
                Basecode
                <p-columnFilter type="text" field="basecode" display="menu" placeholder="Search by basecode"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Default
                <p-columnFilter field="isDefault" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="[{label: 'Yes', value: true}, {label: 'No', value: false}]"
                      (onChange)="filter($event.value)"
                      placeholder="Any"
                      styleClass="w-full"
                      optionLabel="label"
                    >
                      <ng-template let-option pTemplate="item">
                        <span class="font-semibold text-sm">{{ option.label }}</span>
                      </ng-template>
                    </p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Manual
                <p-columnFilter field="isManual" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="[{label: 'Yes', value: true}, {label: 'No', value: false}]"
                      (onChange)="filter($event.value)"
                      placeholder="Any"
                      styleClass="w-full"
                      optionLabel="label"
                    >
                      <ng-template let-option pTemplate="item">
                        <span class="font-semibold text-sm">{{ option.label }}</span>
                      </ng-template>
                    </p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Primary
                <p-columnFilter field="isPrimary" matchMode="equals" display="menu">
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-dropdown
                      [ngModel]="value"
                      [options]="[{label: 'Yes', value: true}, {label: 'No', value: false}]"
                      (onChange)="filter($event.value)"
                      placeholder="Any"
                      styleClass="w-full"
                      optionLabel="label"
                    >
                      <ng-template let-option pTemplate="item">
                        <span class="font-semibold text-sm">{{ option.label }}</span>
                      </ng-template>
                    </p-dropdown>
                  </ng-template>
                </p-columnFilter>
              </div>
            </th>
            <th style="min-width: 80px;">Action</th>
          </tr>
        </ng-template>

        <!-- 👤 Table Body -->
        <ng-template #body let-ser>
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
              <p-checkbox [(ngModel)]="ser.isDefault" binary="true" [disabled]="!ser.isEditing" (onChange)="onDefaultChange(ser)"></p-checkbox>
            </td>
            <td>
              <p-checkbox [(ngModel)]="ser.isManual" binary="true" [disabled]="!ser.isEditing" (onChange)="onManualChange(ser)"></p-checkbox>
            </td>
            <td>
              <p-checkbox [(ngModel)]="ser.isPrimary" binary="true" [disabled]="!ser.isEditing"></p-checkbox>
            </td>
            <td>
            <div class="flex items-center space-x-[8px]">
              <button
                pButton
                icon="pi pi-pencil"
                class="p-button-sm"
                (click)="editRow(ser)"
                [disabled]="ser.has_used_relation"
                title="Edit"
                *ngIf="!ser.isEditing"
              ></button>
              <button
                pButton
                icon="pi pi-check"
                class="p-button-sm"
                (click)="saveRow(ser)"
                title="Save"
                *ngIf="ser.isEditing"
              ></button>
              <button
                pButton
                icon="pi pi-trash"
                class="p-button-sm"
                severity="danger"
                (click)="deleteRow(ser)"
                [disabled]="ser.has_used_relation"
                title="Delete"
              ></button>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- 📊 Total Series Count -->
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
          isPrimary: item.is_primary,
          has_used_relation: item.has_used_relation // Assuming has_used_relation is part of the response
        }))
      );
      // Debug log
      console.log('Series List:', this.seriesList());
    });
  }

  goBack() {
    this.location.back();
  }

  addRow() {
    const newRow: NumberSeries = {
      code: '',
      description: '',
      basecode: '', // Will set to code after code input
      isDefault: false,
      isManual: false,
      isPrimary: false,
      isEditing: true,
      isNew: true
    };
    this.seriesList.set([...this.seriesList(), newRow]);
  }

  saveRow(row: NumberSeries) {
    // Default basecode to code if not set
    if (!row.basecode && row.code) {
      row.basecode = row.code;
    }
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
        },
        error: (err) => {
          const detail = err?.error?.error || 'Failed to save row';
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
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
        },
        error: (err) => {
          const detail = err?.error?.error || 'Failed to update row';
          this.messageService.add({ severity: 'error', summary: 'Error', detail });
        }
      });
    }
  }
  clear(table: Table) {
    table.clear();
  }
  editRow(row: NumberSeries) {
    console.log('Editing row:', row);
    const updatedList = this.seriesList().map(r => {
      if (r === row) {
        // Default basecode to code if not set
        if (!r.basecode && r.code) {
          return { ...r, isEditing: true, basecode: r.code };
        }
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

  onDefaultChange(row: NumberSeries) {
    if (row.isDefault) {
      row.isManual = false;
    }
  }

  onManualChange(row: NumberSeries) {
    if (row.isManual) {
      row.isDefault = false;
    }
  }

  getPrimaryCodeOptions(currentCode?: string) {
    return this.seriesList()
      .filter(item => item.isPrimary && item.code && item.code !== currentCode)
      .map(item => ({ label: item.code, value: item.code }));
  }
}
