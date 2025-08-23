import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

export interface Tariff {
  id?: number;
  code: string;
  mode: string;
  shippingType: string;
  cargoType: string;
  tariffType: string;
  basis: string;
  containerType: string;
  itemName: string;
  currency: string;
  locationTypeFrom: string;
  locationTypeTo: string;
  from: string;
  to: string;
  vendorType: string;
  vendorName: string;
  charges: number;
  freightChargeType: string;
  effectiveDate: string;
  periodStartDate: string;
  periodEndDate: string;
  isMandatory: boolean;  // New field for accounting purposes
}

@Injectable({ providedIn: 'root' })
export class TariffService {
  private baseUrl = '/api/tariff';

  constructor(
    private http: HttpClient, 
    private contextPayload: ContextPayloadService, 
    private contextService: ContextService
  ) {}

  // 🔄 Updated getAll method to match UOM pattern (unconditional context sending)
  getAll(): Observable<Tariff[]> {
    const context = this.contextService.getContext();
    const params: any = {};
    
    if (context.companyCode) {
      params.companyCode = context.companyCode;
    }
    if (context.branchCode) {
      params.branchCode = context.branchCode;
    }
    if (context.departmentCode) {
      params.departmentCode = context.departmentCode;
    }
    
    return this.http.get<Tariff[]>(this.baseUrl, { params });
  }

  create(tariff: Tariff): Observable<Tariff> {
    return this.http.post<Tariff>(this.baseUrl, this.contextPayload.withContext(tariff, this.contextService.getContext()));
  }

  update(id: number, tariff: Tariff): Observable<Tariff> {
    return this.http.put<Tariff>(`${this.baseUrl}/${id}`, this.contextPayload.withContext(tariff, this.contextService.getContext()));
  }
}