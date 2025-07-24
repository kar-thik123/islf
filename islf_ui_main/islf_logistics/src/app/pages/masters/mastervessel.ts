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

import { MasterVesselService, MasterVessel } from '../../services/master-vessel.service';
import { NumberSeriesService } from '@/services/number-series.service';
import { MappingService } from '@/services/mapping.service';

interface FlagOption {
  label: string;
  value: string;
}

@Component({
  selector: 'master-vessel',
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
    DialogModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Vessel Master</div>
      <p-table
        #dt
        [value]="vessels"
        dataKey="id"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['code', 'vessel_name', 'flag', 'year_build']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Vessel" icon="pi pi-plus" (click)="addRow()"></button>
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
                Code
                <p-columnFilter type="text" field="code" display="menu" placeholder="Search by code"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Vessel Name
                <p-columnFilter type="text" field="vessel_name" display="menu" placeholder="Search by name"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Flag
                <p-columnFilter type="text" field="flag" display="menu" placeholder="Search by flag"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Year Build
                <p-columnFilter type="text" field="year_build" display="menu" placeholder="Search by year"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Status
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
        <ng-template pTemplate="body" let-vessel>
          <tr>
            <td>{{ vessel.code }}</td>
            <td>{{ vessel.vessel_name }}</td>
            <td>{{ vessel.flag }}</td>
            <td>{{ vessel.year_build }}</td>
            <td>
              <span
                class="text-sm font-semibold px-3 py-1 rounded-full"
                [ngClass]="{
                  'text-green-700 bg-green-100': vessel.active,
                  'text-red-700 bg-red-100': !vessel.active
                }"
              >
                {{ vessel.active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <td>
              <button pButton icon="pi pi-pencil" (click)="editRow(vessel)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
    <p-dialog
      header="{{ selectedVessel?.isNew ? 'Add' : 'Edit' }} Vessel"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '600px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedVessel" class="p-fluid form-grid dialog-body-padding">
          <div class="grid-container">
            <div class="grid-item">
              <label for="code">Code</label>
              <input id="code" pInputText [(ngModel)]="selectedVessel.code" [disabled]="!isManualSeries || !selectedVessel.isNew" />
            </div>
            <div class="grid-item">
              <label for="vessel_name">Vessel Name</label>
              <input id="vessel_name" pInputText [(ngModel)]="selectedVessel.vessel_name" />
            </div>
            <div class="grid-item">
              <label for="flag">Flag</label>
              <p-dropdown
                id="flag"
                appendTo="body"
                [options]="flagOptions"
                [(ngModel)]="selectedVessel.flag"
                optionLabel="label"
                optionValue="value"
                placeholder="Select Flag"
                [filter]="true"
              ></p-dropdown>
            </div>
           
            <div class="grid-item">
              <label for="year_build">Year Build</label>
              <input id="year_build" pInputText [(ngModel)]="selectedVessel.year_build" />
            </div>
            <div class="grid-item">
              <label for="active">Status</label>
              <p-dropdown
                appendTo="body"
                id="active"
                [options]="activeOptions"
                [(ngModel)]="selectedVessel.active"
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
          <button pButton label="{{ selectedVessel?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()"></button>
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
    label {
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
  `]
})
export class MasterVesselComponent implements OnInit {
  vessels: MasterVessel[] = [];
  flagOptions: FlagOption[] = [
    { label: 'Panama', value: 'Panama' },
    { label: 'Liberia', value: 'Liberia' },
    { label: 'Marshall Islands', value: 'Marshall Islands' },
    { label: 'Singapore', value: 'Singapore' },
    { label: 'Malta', value: 'Malta' },
    { label: 'Bahamas', value: 'Bahamas' },
    { label: 'Greece', value: 'Greece' },
    { label: 'Hong Kong', value: 'Hong Kong' },
    { label: 'India', value: 'India' }
  ];
  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];
  mappedVesselSeriesCode: string | null = null;
  isManualSeries: boolean = false;
  isDialogVisible = false;
  selectedVessel: (MasterVessel & { isNew?: boolean }) | null = null;

  constructor(
    private masterVesselService: MasterVesselService,
    private mappingService: MappingService,
    private numberSeriesService: NumberSeriesService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.refreshList();
    this.loadMappedVesselSeriesCode();
  }

  loadMappedVesselSeriesCode() {
    this.mappingService.getMapping().subscribe(mapping => {
      this.mappedVesselSeriesCode = mapping.vesselCode;
      if (this.mappedVesselSeriesCode) {
        this.numberSeriesService.getAll().subscribe(seriesList => {
          const found = seriesList.find((s: any) => s.code === this.mappedVesselSeriesCode);
          this.isManualSeries = !!(found && found.is_manual);
        });
      } else {
        this.isManualSeries = false;
      }
    });
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refreshList() {
    this.masterVesselService.getAll().subscribe(data => {
      this.vessels = data;
    });
  }

  addRow() {
    this.selectedVessel = {
      code: '', // Will be filled after creation or entered if manual
      vessel_name: '',
      flag: '',
      year_build: '',
      active: true,
      isNew: true
    };
    this.isDialogVisible = true;
  }

  editRow(vessel: MasterVessel) {
    this.selectedVessel = { ...vessel, isNew: false };
    this.isDialogVisible = true;
  }

  saveRow() {
    if (!this.selectedVessel) return;
    if (!this.selectedVessel.vessel_name || !this.selectedVessel.flag || !this.selectedVessel.year_build) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Vessel Name, Flag, and Year Build are required.'
      });
      return;
    }
    if (this.selectedVessel.isNew && this.vessels.some(v => v.code === this.selectedVessel?.code)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Duplicate Code',
        detail: 'Vessel with the same code already exists.'
      });
      return;
    }
    const payload: any = {
      vessel_name: this.selectedVessel.vessel_name,
      flag: this.selectedVessel.flag,
      year_build: this.selectedVessel.year_build,
      active: this.selectedVessel.active,
      seriesCode: this.mappedVesselSeriesCode // Always use mapped code
    };
    if (this.selectedVessel.code) {
      payload.code = this.selectedVessel.code; // For manual series
    }
    const req = this.selectedVessel.isNew
      ? this.masterVesselService.create(payload)
      : this.masterVesselService.update(this.selectedVessel.id!, this.selectedVessel);
    req.subscribe({
      next: (createdVessel) => {
        const msg = this.selectedVessel?.isNew ? 'Vessel created' : 'Vessel updated';
        this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
        this.refreshList();
        this.hideDialog();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Operation failed' });
      }
    });
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedVessel = null;
  }

  clear(table: any) {
    table.clear();
  }
}
