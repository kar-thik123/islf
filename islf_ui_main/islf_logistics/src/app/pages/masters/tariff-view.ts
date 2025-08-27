import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TariffService } from '@/services/tariff.service';
import { ServiceTypeService } from '@/services/servicetype.service';
import { VendorService } from '@/services/vendor.service';
import { Subscription } from 'rxjs';
import { ContextService } from '@/services/context.service';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-tariff-view',
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
    AccordionModule,
    CardModule,
    DividerModule
  ],
  template: `
    <p-toast></p-toast>
    <div class="card">
      <div class="font-semibold text-xl mb-4">Tariff View</div>
      
      <!-- Filter Section -->
      <div class="grid grid-cols-12 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="col-span-12 md:col-span-6">
          <label class="block font-semibold mb-2">Service Type (Shipping Type)</label>
          <p-dropdown 
            [options]="serviceTypeOptions" 
            [(ngModel)]="selectedServiceType" 
            (ngModelChange)="onFilterChange()"
            placeholder="Select Service Type" 
            [filter]="true" 
            filterBy="label" 
            [showClear]="true" 
            class="w-full">
          </p-dropdown>
        </div>
        <div class="col-span-12 md:col-span-6">
          <label class="block font-semibold mb-2">Vendor Name</label>
          <p-dropdown 
            [options]="vendorOptions" 
            [(ngModel)]="selectedVendor" 
            (ngModelChange)="onFilterChange()"
            placeholder="Select Vendor" 
            [filter]="true" 
            filterBy="label" 
            [showClear]="true" 
            class="w-full">
          </p-dropdown>
        </div>
      </div>

      <!-- Results Summary -->
      <div class="mb-4" *ngIf="selectedServiceType || selectedVendor">
        <p class="text-gray-600">
          Showing tariffs for 
          <span *ngIf="selectedServiceType" class="font-semibold">{{ getServiceTypeLabel(selectedServiceType) }}</span>
          <span *ngIf="selectedServiceType && selectedVendor"> and </span>
          <span *ngIf="selectedVendor" class="font-semibold">{{ getVendorLabel(selectedVendor) }}</span>
        </p>
      </div>

      <!-- Unit Tariff Table -->
      <div class="mb-6" *ngIf="unitTariffs.length > 0">
        <h3 class="text-lg font-semibold mb-3 text-blue-700">Unit Tariff (Basis-based)</h3>
        <p-table 
          [value]="unitTariffs"
          dataKey="id"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          [showGridlines]="true"
          [rowHover]="true"
          responsiveLayout="scroll"
          [expandedRowKeys]="expandedRows">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 3rem"></th>
              <th>Code</th>
              <th>Mode</th>
              <th>Cargo Type</th>
              <th>Tariff Type</th>
              <th>Basis</th>
              <th>Item Name</th>
              <th>Currency</th>
              <th>Charges</th>
              <th>Status</th>
              <th>Effective Date</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-tariff let-expanded="expanded">
            <tr>
              <td>
                <button 
                  type="button" 
                  pButton 
                  pRipple 
                  [pRowToggler]="tariff" 
                  class="p-button-text p-button-rounded p-button-plain" 
                  [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'">
                </button>
              </td>
              <td>{{ tariff.code }}</td>
              <td>{{ tariff.mode }}</td>
              <td>{{ tariff.cargoType }}</td>
              <td>{{ tariff.tariffType }}</td>
              <td>{{ tariff.basis }}</td>
              <td>{{ tariff.itemName }}</td>
              <td>{{ tariff.currency }}</td>
              <td>{{ tariff.charges | currency:'USD':'symbol':'1.2-2' }}</td>
              <td>
                <span [class]="getStatusClass(tariff.status)">{{ tariff.status }}</span>
              </td>
              <td>{{ tariff.effectiveDate | date:'shortDate' }}</td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="rowexpansion" let-tariff>
            <tr>
              <td colspan="11">
                <div class="p-4 bg-gray-50">
                  <h4 class="font-semibold mb-3">Tariff Details</h4>
                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-4">
                      <strong>Container Type:</strong> {{ tariff.containerType || 'N/A' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Freight Charge Type:</strong> {{ tariff.freightChargeType || 'N/A' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Mandatory:</strong> {{ tariff.isMandatory ? 'Yes' : 'No' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Period Start:</strong> {{ tariff.periodStartDate | date:'shortDate' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Period End:</strong> {{ tariff.periodEndDate | date:'shortDate' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Vendor Type:</strong> {{ tariff.vendorType || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="11" class="text-center p-4">
                No unit tariffs found for the selected criteria.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- From-To Tariff Table -->
      <div class="mb-6" *ngIf="fromToTariffs.length > 0">
        <h3 class="text-lg font-semibold mb-3 text-green-700">From-To Tariff (Location-based)</h3>
        <p-table 
          [value]="fromToTariffs"
          dataKey="id"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 20]"
          [showGridlines]="true"
          [rowHover]="true"
          responsiveLayout="scroll"
          [expandedRowKeys]="expandedRowsFromTo">
          
          <ng-template pTemplate="header">
            <tr>
              <th style="width: 3rem"></th>
              <th>Code</th>
              <th>Mode</th>
              <th>From Location</th>
              <th>To Location</th>
              <th>Location Type From</th>
              <th>Location Type To</th>
              <th>Currency</th>
              <th>Charges</th>
              <th>Status</th>
              <th>Effective Date</th>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="body" let-tariff let-expanded="expanded">
            <tr>
              <td>
                <button 
                  type="button" 
                  pButton 
                  pRipple 
                  [pRowToggler]="tariff" 
                  class="p-button-text p-button-rounded p-button-plain" 
                  [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'">
                </button>
              </td>
              <td>{{ tariff.code }}</td>
              <td>{{ tariff.mode }}</td>
              <td>{{ tariff.from }}</td>
              <td>{{ tariff.to }}</td>
              <td>{{ tariff.locationTypeFrom }}</td>
              <td>{{ tariff.locationTypeTo }}</td>
              <td>{{ tariff.currency }}</td>
              <td>{{ tariff.charges | currency:'USD':'symbol':'1.2-2' }}</td>
              <td>
                <span [class]="getStatusClass(tariff.status)">{{ tariff.status }}</span>
              </td>
              <td>{{ tariff.effectiveDate | date:'shortDate' }}</td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="rowexpansion" let-tariff>
            <tr>
              <td colspan="11">
                <div class="p-4 bg-gray-50">
                  <h4 class="font-semibold mb-3">Tariff Details</h4>
                  <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-12 md:col-span-4">
                      <strong>Cargo Type:</strong> {{ tariff.cargoType || 'N/A' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Tariff Type:</strong> {{ tariff.tariffType || 'N/A' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Container Type:</strong> {{ tariff.containerType || 'N/A' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Item Name:</strong> {{ tariff.itemName || 'N/A' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Freight Charge Type:</strong> {{ tariff.freightChargeType || 'N/A' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Mandatory:</strong> {{ tariff.isMandatory ? 'Yes' : 'No' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Period Start:</strong> {{ tariff.periodStartDate | date:'shortDate' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Period End:</strong> {{ tariff.periodEndDate | date:'shortDate' }}
                    </div>
                    <div class="col-span-12 md:col-span-4">
                      <strong>Vendor Type:</strong> {{ tariff.vendorType || 'N/A' }}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </ng-template>
          
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="11" class="text-center p-4">
                No from-to tariffs found for the selected criteria.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

      <!-- No Results Message -->
      <div *ngIf="(selectedServiceType || selectedVendor) && unitTariffs.length === 0 && fromToTariffs.length === 0" 
           class="text-center p-8 bg-gray-50 rounded-lg">
        <i class="pi pi-info-circle text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-semibold text-gray-600 mb-2">No Tariffs Found</h3>
        <p class="text-gray-500">No tariffs match the selected criteria. Please try different filters.</p>
      </div>

      <!-- Initial State Message -->
      <div *ngIf="!selectedServiceType && !selectedVendor" 
           class="text-center p-8 bg-blue-50 rounded-lg">
        <i class="pi pi-filter text-4xl text-blue-400 mb-4"></i>
        <h3 class="text-lg font-semibold text-blue-600 mb-2">Select Filters</h3>
        <p class="text-blue-500">Please select a service type and/or vendor to view related tariffs.</p>
      </div>
    </div>
  `,
  styles: [`
    .status-expired {
      color: #dc2626;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background-color: #fee2e2;
    }

    .status-active {
      color: #059669;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background-color: #d1fae5;
    }

    .status-default {
      color: #6b7280;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 4px;
      background-color: #f3f4f6;
    }

    .p-button-text {
      color: #6366f1;
    }

    .p-button-text:hover {
      background-color: #e0e7ff;
    }
  `]
})
export class TariffViewComponent implements OnInit, OnDestroy {
  private contextSubscription: Subscription | undefined;
  
  // Filter options
  serviceTypeOptions: any[] = [];
  vendorOptions: any[] = [];
  
  // Selected filters
  selectedServiceType: string = '';
  selectedVendor: string = '';
  
  // Tariff data
  allTariffs: any[] = [];
  unitTariffs: any[] = [];
  fromToTariffs: any[] = [];
  
  // Expanded rows
  expandedRows: any = {};
  expandedRowsFromTo: any = {};

  constructor(
    private tariffService: TariffService,
    private serviceTypeService: ServiceTypeService,
    private vendorService: VendorService,
    private messageService: MessageService,
    private contextService: ContextService
  ) {}

  ngOnInit() {
    this.loadInitialData();
    this.setupContextSubscription();
  }

  ngOnDestroy() {
    if (this.contextSubscription) {
      this.contextSubscription.unsubscribe();
    }
  }

  private setupContextSubscription() {
    this.contextSubscription = this.contextService.context$.subscribe(() => {
      this.loadInitialData();
    });
  }

  loadInitialData() {
    this.loadServiceTypes();
    this.loadVendors();
    this.loadTariffs();
  }

  loadServiceTypes() {
    this.serviceTypeService.getAll().subscribe({
      next: (data) => {
        this.serviceTypeOptions = data.map((item: any) => ({
          label: item.name || item.service_type,
          value: item.name || item.service_type
        }));
      },
      error: (error) => {
        console.error('Error loading service types:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load service types'
        });
      }
    });
  }

  loadVendors() {
    this.vendorService.getAll().subscribe({
      next: (data) => {
        this.vendorOptions = data.map((vendor: any) => ({
          label: `${vendor.vendor_no || vendor.code} - ${vendor.name2 || vendor.name || vendor.vendor_name}`,
          value: vendor.vendor_no || vendor.code  // Store vendor code for consistency
        }));
      },
      error: (error) => {
        console.error('Error loading vendors:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load vendors'
        });
      }
    });
  }

  loadTariffs() {
    this.tariffService.getAll().subscribe({
      next: (data) => {
        this.allTariffs = data.map((tariff: any) => {
          const mappedTariff = {
            ...tariff,
            shippingType: tariff.shipping_type,
            cargoType: tariff.cargo_type,
            containerType: tariff.container_type,
            itemName: tariff.item_name,
            from: tariff.from_location,
            to: tariff.to_location,
            vendorType: tariff.vendor_type,
            vendorName: tariff.vendor_name,
            locationTypeFrom: tariff.location_type_from,
            locationTypeTo: tariff.location_type_to,
            tariffType: tariff.tariff_type,
            basis: tariff.basis,
            currency: tariff.currency,
            charges: tariff.charges,
            mode: tariff.mode,
            effectiveDate: tariff.effective_date,
            periodStartDate: tariff.period_start_date,
            periodEndDate: tariff.period_end_date,
            freightChargeType: tariff.freight_charge_type,
            isMandatory: tariff.is_mandatory
          };
          // Add status field
          mappedTariff.status = this.getTariffStatus(mappedTariff);
          return mappedTariff;
        });
        this.filterTariffs();
      },
      error: (error) => {
        console.error('Error loading tariffs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load tariffs'
        });
      }
    });
  }

  onFilterChange() {
    this.filterTariffs();
  }

  filterTariffs() {
    let filteredTariffs = this.allTariffs;
  
    // Filter by service type (shipping type)
    if (this.selectedServiceType) {
      filteredTariffs = filteredTariffs.filter(tariff => 
        tariff.shippingType === this.selectedServiceType
      );
    }
  
    // Filter by vendor - check both vendor_name and vendor code
    if (this.selectedVendor) {
      filteredTariffs = filteredTariffs.filter(tariff => 
        tariff.vendorName === this.selectedVendor || 
        tariff.vendor_no === this.selectedVendor ||
        tariff.party_name === this.selectedVendor
      );
    }
  
    // Updated logic for separating tariffs:
    // Unit Tariff: Either from OR to (but not both) AND basis required
    this.unitTariffs = filteredTariffs.filter(tariff => {
      const hasFrom = tariff.from && tariff.from.trim() !== '';
      const hasTo = tariff.to && tariff.to.trim() !== '';
      const hasBasis = tariff.basis && tariff.basis.trim() !== '';
      
      // Either from OR to (but not both) AND basis must be present
      return ((hasFrom && !hasTo) || (!hasFrom && hasTo)) && hasBasis;
    });
  
    // From-To Tariff: Both from AND to AND basis
    this.fromToTariffs = filteredTariffs.filter(tariff => {
      const hasFrom = tariff.from && tariff.from.trim() !== '';
      const hasTo = tariff.to && tariff.to.trim() !== '';
      const hasBasis = tariff.basis && tariff.basis.trim() !== '';
      
      // Must have both from AND to AND basis
      return hasFrom && hasTo && hasBasis;
    });
  }

  getTariffStatus(tariff: { periodEndDate?: string | Date }): string {
    if (!tariff.periodEndDate) {
      return 'Active';
    }

    const nowUtc = new Date();
    const endDateUtc = new Date(tariff.periodEndDate);
    endDateUtc.setUTCHours(23, 59, 59, 999);

    if (nowUtc.getTime() > endDateUtc.getTime()) {
      return 'Expired';
    }

    return 'Active';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Expired':
        return 'status-expired';
      default:
        return 'status-default';
    }
  }

  getServiceTypeLabel(value: string): string {
    const option = this.serviceTypeOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }

  getVendorLabel(value: string): string {
    const option = this.vendorOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  }
}