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

import { MasterLocationService, MasterLocation } from '../../services/master-location.service';
import { MasterTypeService } from '../../services/mastertype.service';

@Component({
  selector: 'master-location',
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
      <div class="font-semibold text-xl mb-4">Master Location</div>

      <p-table
        #dt
        [value]="locations"
        dataKey="code"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 20, 50]"
        [showGridlines]="true"
        [rowHover]="true"
        [globalFilterFields]="['type', 'code', 'name', 'country', 'state', 'city', 'gst_state_code', 'pin_code']"
        responsiveLayout="scroll"
      >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center">
            <button pButton type="button" label="Add Location" icon="pi pi-plus" (click)="addRow()"></button>
            <input pInputText type="text" (input)="onGlobalFilter($event, dt)" placeholder="Search keyword" />
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th>Type</th>
            <th>Code</th>
            <th>Name</th>
            <th>Country</th>
            <th>State</th>
            <th>City</th>
            <th>GST State Code</th>
            <th>Pin Code</th>
            <th>Active</th>
            <th>Action</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-loc>
          <tr>
            <td>{{ loc.type }}</td>
            <td>{{ loc.code }}</td>
            <td>{{ loc.name }}</td>
            <td>{{ loc.country }}</td>
            <td>{{ loc.state }}</td>
            <td>{{ loc.city }}</td>
            <td>{{ loc.gst_state_code }}</td>
            <td>{{ loc.pin_code }}</td>
            <td>
              <span [class.active]="loc.active" [class.inactive]="!loc.active">
                {{ loc.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <button pButton type="button" icon="pi pi-pencil" (click)="editRow(loc)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      header="{{ selectedLocation?.isNew ? 'Add' : 'Edit' }} Location"
      [(visible)]="isDialogVisible"
      [modal]="true"
      [style]="{ width: '750px' }"
      [closable]="false"
      [draggable]="false"
      [resizable]="false"
      (onHide)="hideDialog()"
    >
      <ng-template pTemplate="content">
        <div *ngIf="selectedLocation" class="p-fluid form-grid dialog-body-padding">
          <div class="grid-container">
            <div class="grid-item">
              <label for="type">Type</label>
              <p-dropdown
                id="type"
                [options]="locationTypeOptions"
                [(ngModel)]="selectedLocation.type"
                optionLabel="value"
                optionValue="value"
                placeholder="Select Type"
                [filter]="true"
                [disabled]="!selectedLocation.isNew"
              ></p-dropdown>
            </div>
            <div class="grid-item">
              <label for="code">Code</label>
              <input id="code" pInputText [(ngModel)]="selectedLocation.code" [disabled]="!selectedLocation.isNew" />
            </div>
            <div class="grid-item">
              <label for="name">Name</label>
              <input id="name" pInputText [(ngModel)]="selectedLocation.name" />
            </div>
            <div class="grid-item">
              <label for="country">Country</label>
              <input id="country" pInputText [(ngModel)]="selectedLocation.country" />
            </div>
            <div class="grid-item">
              <label for="state">State</label>
              <input id="state" pInputText [(ngModel)]="selectedLocation.state" />
            </div>
            <div class="grid-item">
              <label for="city">City</label>
              <input id="city" pInputText [(ngModel)]="selectedLocation.city" />
            </div>
            <div class="grid-item">
              <label for="gst_state_code">GST State Code</label>
              <input id="gst_state_code" pInputText [(ngModel)]="selectedLocation.gst_state_code" />
            </div>
             <div class="grid-item">
              <label for="active">Status</label>
              <p-dropdown
                id="active"
                [options]="activeOptions"
                [(ngModel)]="selectedLocation.active"
                optionLabel="label"
                optionValue="value"
              ></p-dropdown>
            </div>
            <div class="grid-item">
              <label for="pin_code">Pin Code</label>
              <input id="pin_code" pInputText [(ngModel)]="selectedLocation.pin_code" />
            </div>
           
          </div>
        </div>
      </ng-template>
      <ng-template pTemplate="footer">
        <div class="flex justify-content-end gap-2 px-3 pb-2">
          <button pButton label="Cancel" icon="pi pi-times" class="p-button-outlined p-button-secondary" (click)="hideDialog()"></button>
          <button pButton label="{{ selectedLocation?.isNew ? 'Add' : 'Update' }}" icon="pi pi-check" (click)="saveRow()"></button>
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
export class MasterLocationComponent implements OnInit {
  locations: MasterLocation[] = [];
  locationTypeOptions: any[] = [];
  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  isDialogVisible = false;
  selectedLocation: (MasterLocation & { isNew?: boolean }) | null = null;

  constructor(
    private masterLocationService: MasterLocationService,
    private masterTypeService: MasterTypeService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.refreshList();
    this.masterTypeService.getAll().subscribe((types: any[]) => {
      this.locationTypeOptions = types.filter(t => t.key === 'Location' && t.status === 'Active');
    });
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refreshList() {
    this.masterLocationService.getAll().subscribe(data => {
      this.locations = data;
    });
  }

  addRow() {
    this.selectedLocation = {
      type: '',
      code: '',
      name: '',
      country: '',
      state: '',
      city: '',
      gst_state_code: '',
      pin_code: '',
      active: true,
      isNew: true,
    };
    this.isDialogVisible = true;
  }

  editRow(loc: MasterLocation) {
    this.selectedLocation = { ...loc, isNew: false };
    this.isDialogVisible = true;
  }

  saveRow() {
    if (!this.selectedLocation) {
      return;
    }

    if (this.selectedLocation.isNew) {
      this.masterLocationService.create(this.selectedLocation).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location created' });
          this.refreshList();
          this.hideDialog();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create location' })
      });
    } else {
      this.masterLocationService.update(this.selectedLocation.code, this.selectedLocation).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location updated' });
          this.refreshList();
          this.hideDialog();
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update location' })
      });
    }
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedLocation = null;
  }
}
