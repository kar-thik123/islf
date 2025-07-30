import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { MasterLocationService, MasterLocation } from '../../services/master-location.service';
import { MasterTypeService } from '../../services/mastertype.service';
import { Country, State, City } from 'country-state-city/lib';

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
    SelectModule,
    ToastModule,
    DialogModule,
    TabsModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Location</div>

                      <p-tabs [(value)]="activeTabIndex" (onChange)="onTabChange($event)">
          <p-tablist>
            <p-tab *ngFor="let locationType of locationTypes; let i = index" [value]="i">
              {{ locationType.label }}
            </p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel *ngFor="let locationType of locationTypes; let i = index" [value]="i">
            <p-table
              #dt
              [value]="getLocationsByType(locationType.value)"
              dataKey="code"
              [paginator]="true"
              [rows]="10"
              [rowsPerPageOptions]="[5, 10, 20, 50]"
              [showGridlines]="true"
              [rowHover]="true"
              [globalFilterFields]="['code', 'name', 'country', 'state', 'city', 'gst_state_code', 'pin_code']"
              responsiveLayout="scroll"
            >
        <ng-template pTemplate="caption">
          <div class="flex justify-between items-center flex-col sm:flex-row gap-2">
            <button pButton type="button" label="Add Location" icon="pi pi-plus" (click)="addRow()"></button>
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
                Name
                <p-columnFilter type="text" field="name" display="menu" placeholder="Search by name"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Country
                <p-columnFilter type="text" field="country" display="menu" placeholder="Search by country"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                State
                <p-columnFilter type="text" field="state" display="menu" placeholder="Search by state"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                City
                <p-columnFilter type="text" field="city" display="menu" placeholder="Search by city"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                GST State Code
                <p-columnFilter type="text" field="gst_state_code" display="menu" placeholder="Search by GST state code"></p-columnFilter>
              </div>
            </th>
            <th>
              <div class="flex justify-between items-center">
                Pin Code
                <p-columnFilter type="text" field="pin_code" display="menu" placeholder="Search by pin code"></p-columnFilter>
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

        <ng-template pTemplate="body" let-loc>
          <tr>
            <td>{{ loc.code }}</td>
            <td>{{ loc.name }}</td>
            <td>{{ loc.country }}</td>
            <td>{{ loc.state }}</td>
            <td>{{ loc.city }}</td>
            <td>{{ loc.gst_state_code }}</td>
            <td>{{ loc.pin_code }}</td>
           <td>
            <span
              class="text-sm font-semibold px-3 py-1 rounded-full"
              [ngClass]="{
                'text-green-700 bg-green-100': loc.active,
                'text-red-700 bg-red-100': !loc.active
              }"
            >
              {{ loc.active ? 'Active' : 'Inactive' }}
            </span>
          </td>

            <td>
              <button pButton type="button" icon="pi pi-pencil" (click)="editRow(loc)" class="p-button-sm"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
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
              <input 
                id="type" 
                pInputText 
                [(ngModel)]="selectedLocation.type" 
                [readonly]="selectedLocation.isNew"
                [style]="{'background-color': selectedLocation.isNew ? '#f3f4f6' : 'white', 'cursor': selectedLocation.isNew ? 'not-allowed' : 'text'}"
                placeholder="Type will be set automatically"
              />
              <small *ngIf="selectedLocation.isNew" class="text-gray-500 text-xs mt-1">
                Type is automatically set based on the selected tab
              </small>
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
              <p-select
                id="country"
                [options]="countryOptions"
                [(ngModel)]="selectedLocation.country"
                optionLabel="label"
                optionValue="value"
                placeholder="Select or type Country"
                [filter]="true"
                [editable]="true"
                [showClear]="true"
                (onChange)="onCountryChange()"
                (onInput)="onCountryInput($event)"
              ></p-select>
            </div>
            <div class="grid-item">
              <label for="state">State</label>
              <p-select
                id="state"
                [options]="stateOptions"
                [(ngModel)]="selectedLocation.state"
                optionLabel="label"
                optionValue="value"
                placeholder="Select or type State"
                [filter]="true"
                [editable]="true"
                [showClear]="true"
                (onChange)="onStateChange()"
                (onInput)="onStateInput($event)"
              ></p-select>
            </div>
            <div class="grid-item">
              <label for="city">City</label>
              <p-select
                id="city"
                [options]="cityOptions"
                [(ngModel)]="selectedLocation.city"
                optionLabel="label"
                optionValue="value"
                placeholder="Select or type City"
                [filter]="true"
                [editable]="true"
                [showClear]="true"
                (onInput)="onCityInput($event)"
              ></p-select>
            </div>
            <div class="grid-item">
              <label for="gst_state_code">GST State Code</label>
              <input id="gst_state_code" pInputText [(ngModel)]="selectedLocation.gst_state_code" />
            </div>
             <div class="grid-item">
              <label for="active">Status</label>
              <p-select
                id="active"
                [options]="activeOptions"
                [(ngModel)]="selectedLocation.active"
                optionLabel="label"
                optionValue="value"
              ></p-select>
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
  locationTypes: { label: string; value: string }[] = [];
  activeTabIndex = 0;
  activeTabValue = '';
  activeOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  // Country, State, City options
  countryOptions: { label: string; value: string }[] = [];
  stateOptions: { label: string; value: string }[] = [];
  cityOptions: { label: string; value: string }[] = [];

  isDialogVisible = false;
  selectedLocation: (MasterLocation & { isNew?: boolean }) | null = null;

  constructor(
    private masterLocationService: MasterLocationService,
    private masterTypeService: MasterTypeService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.refreshList();
    this.loadCountryData();
    this.masterTypeService.getAll().subscribe((types: any[]) => {
      this.locationTypeOptions = types.filter(t => t.key === 'Location' && t.status === 'Active');
      console.log('Location type options from master type:', this.locationTypeOptions);
      this.updateLocationTypes();
    });
  }

  onGlobalFilter(event: Event, table: any) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  refreshList() {
    this.masterLocationService.getAll().subscribe(data => {
      this.locations = data;
      this.updateLocationTypes();
    });
  }

  addRow() {
    // Set default type based on active tab index
    const defaultType = this.locationTypes.length > 0 ? this.locationTypes[this.activeTabIndex]?.value : '';
    
    console.log('Adding new location:');
    console.log('Active tab index:', this.activeTabIndex);
    console.log('Active tab value:', this.activeTabValue);
    console.log('Location types:', this.locationTypes);
    console.log('Default type:', defaultType);
    
    this.selectedLocation = {
      type: defaultType,
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
    
    // Load country data for the new location
    this.loadCountryData();
  }

  editRow(loc: MasterLocation) {
    this.selectedLocation = { ...loc, isNew: false };
    this.isDialogVisible = true;
    
    // Load state and city options for existing location
    if (loc.country) {
      this.onCountryChange();
      if (loc.state) {
        this.onStateChange();
      }
    }
  }

  saveRow() {
    if (!this.selectedLocation) {
      return;
    }

    // Add custom options if they don't exist in the dropdowns
    if (this.selectedLocation.country) {
      this.addCustomOption('country', this.selectedLocation.country);
    }
    if (this.selectedLocation.state) {
      this.addCustomOption('state', this.selectedLocation.state);
    }
    if (this.selectedLocation.city) {
      this.addCustomOption('city', this.selectedLocation.city);
    }

    if (this.selectedLocation.isNew) {
      this.masterLocationService.create(this.selectedLocation).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location created successfully' });
          this.refreshList();
          this.hideDialog();
        },
        error: (error) => {
          console.error('Error creating location:', error);
          let errorMessage = 'Failed to create location';
          
          if (error?.error?.detail) {
            // Use the specific error detail from backend
            errorMessage = error.error.detail;
          } else if (error?.error?.error) {
            // Handle different error types
            if (error.error.error === 'Duplicate code') {
              errorMessage = error.error.detail || `Location code "${this.selectedLocation?.code || 'unknown'}" already exists. Please use a different code.`;
            } else {
              errorMessage = error.error.error;
            }
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: errorMessage 
          });
        }
      });
    } else {
      this.masterLocationService.update(this.selectedLocation.code, this.selectedLocation).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Location updated successfully' });
          this.refreshList();
          this.hideDialog();
        },
        error: (error) => {
          console.error('Error updating location:', error);
          let errorMessage = 'Failed to update location';
          
          if (error?.error?.detail) {
            errorMessage = error.error.detail;
          } else if (error?.error?.error) {
            errorMessage = error.error.error;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: errorMessage 
          });
        }
      });
    }
  }

  hideDialog() {
    this.isDialogVisible = false;
    this.selectedLocation = null;
  }

  clear(table: any) {
    table.clear();
  }

  updateLocationTypes() {
    // Create location types array for tabs from master type options
    this.locationTypes = this.locationTypeOptions.map(type => ({
      label: type.value.toUpperCase(),
      value: type.value
    }));

    console.log('Location types for tabs:', this.locationTypes);
    console.log('Active tab index before update:', this.activeTabIndex);
    console.log('Active tab value before update:', this.activeTabValue);

    // Set default active tab to first type if available
    if (this.locationTypes.length > 0) {
      this.activeTabValue = this.locationTypes[this.activeTabIndex].value;
      console.log('Set activeTabValue to:', this.activeTabValue);
    }
  }

  getLocationsByType(type: string): MasterLocation[] {
    return this.locations.filter(loc => loc.type === type);
  }

  onTabChange(event: any) {
    console.log('Tab changed to index:', event.value);
    this.activeTabIndex = event.value;
    if (this.locationTypes.length > event.value) {
      this.activeTabValue = this.locationTypes[event.value].value;
      console.log('Updated activeTabValue from index:', this.activeTabValue);
    }
  }

  // Country, State, City methods
  loadCountryData() {
    this.countryOptions = Country.getAllCountries().map(country => ({
      label: country.name,
      value: country.name
    }));
  }



  // Method to add custom options if missing
  addCustomOption(type: 'country' | 'state' | 'city', value: string) {
    if (!value || value.trim() === '') return;
    
    const customOption = { label: value.trim(), value: value.trim() };
    
    switch (type) {
      case 'country':
        if (!this.countryOptions.find(opt => opt.value.toLowerCase() === value.toLowerCase())) {
          this.countryOptions.push(customOption);
          // Sort options alphabetically
          this.countryOptions.sort((a, b) => a.label.localeCompare(b.label));
        }
        break;
      case 'state':
        if (!this.stateOptions.find(opt => opt.value.toLowerCase() === value.toLowerCase())) {
          this.stateOptions.push(customOption);
          // Sort options alphabetically
          this.stateOptions.sort((a, b) => a.label.localeCompare(b.label));
        }
        break;
      case 'city':
        if (!this.cityOptions.find(opt => opt.value.toLowerCase() === value.toLowerCase())) {
          this.cityOptions.push(customOption);
          // Sort options alphabetically
          this.cityOptions.sort((a, b) => a.label.localeCompare(b.label));
        }
        break;
    }
  }

  // Input handling methods for manual entries
  onCountryInput(event: any) {
    const value = event.target.value;
    if (value && value.trim() !== '') {
      // Add custom option if it doesn't exist
      this.addCustomOption('country', value);
    }
  }

  onStateInput(event: any) {
    const value = event.target.value;
    if (value && value.trim() !== '') {
      // Add custom option if it doesn't exist
      this.addCustomOption('state', value);
    }
  }

  onCityInput(event: any) {
    const value = event.target.value;
    if (value && value.trim() !== '') {
      // Add custom option if it doesn't exist
      this.addCustomOption('city', value);
    }
  }

  // Enhanced country change to handle manual entries
  onCountryChange() {
    if (!this.selectedLocation?.country) {
      this.stateOptions = [];
      this.cityOptions = [];
      if (this.selectedLocation) {
        this.selectedLocation.state = '';
        this.selectedLocation.city = '';
      }
      return;
    }

    // Check if it's a manual entry or from dropdown
    const country = Country.getAllCountries().find(c => c.name === this.selectedLocation!.country);
    if (country) {
      // It's a valid country from the database
      this.stateOptions = State.getStatesOfCountry(country.isoCode).map(state => ({
        label: state.name,
        value: state.name
      }));
    } else {
      // It's a manual entry, keep existing state options or clear them
      // Don't clear state options for manual country entries
    }
    
    // Clear city options when country changes
    this.cityOptions = [];
    this.selectedLocation!.city = '';
  }

  // Enhanced state change to handle manual entries
  onStateChange() {
    if (!this.selectedLocation?.country || !this.selectedLocation?.state) {
      this.cityOptions = [];
      if (this.selectedLocation) {
        this.selectedLocation.city = '';
      }
      return;
    }

    // Check if both country and state are from the database
    const country = Country.getAllCountries().find(c => c.name === this.selectedLocation!.country);
    if (country) {
      const state = State.getStatesOfCountry(country.isoCode).find(s => s.name === this.selectedLocation!.state);
      
      if (state) {
        // Both country and state are valid, load cities
        this.cityOptions = City.getCitiesOfState(country.isoCode, state.isoCode).map(city => ({
          label: city.name,
          value: city.name
        }));
      } else {
        // State is manual entry, keep existing city options or clear them
        // Don't clear city options for manual state entries
      }
    } else {
      // Country is manual entry, keep existing city options or clear them
      // Don't clear city options for manual country entries
    }
    
    // Clear city selection when state changes
    this.selectedLocation!.city = '';
  }
}
