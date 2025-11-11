import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { environment } from '../../environments/environment';

export interface Tariff {
  id?: number;
  code: string;
  mode: string;
  shippingType: string;
  type: string;
  serviceArea: string;
  vendorType: string;
  vendorName: string;
  cargoType: string;
  basis: string;
  locationTypeFrom: string;
  locationTypeTo: string;
  from: string;
  to: string;
  charges: TariffCharge[];
  isMandatory?: boolean;
  // New field for accounting purposes
}

export interface TariffCharge {
  id?: number;
  tariffId?: number;
  chargeName: string;
  basis: string;
  currency: string | number;
  charge: number;
  gstVat: string;
  periodStartDate: string;
  periodEndDate: string;
  remarks: string;
}

@Injectable({ providedIn: 'root' })
export class TariffService {
  private baseUrl = `${environment.apiUrl}/api/tariff`;

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
    return this.http.post<Tariff>(
      this.baseUrl,
      this.contextPayload.withContext(tariff, this.contextService.getContext())
    );
  }

  update(id: number, tariff: Tariff): Observable<Tariff> {
    return this.http.put<Tariff>(
      `${this.baseUrl}/${id}`,
      this.contextPayload.withContext(tariff, this.contextService.getContext())
    );
  }

  // Delete charge Method
  deleteCharge(tariffId: number,  chargeId: number): Observable<void>{
    return this.http.delete<void>(`${this.baseUrl}/${tariffId}/charge/${chargeId}`);
  }

  // get charges Method
  getCharges(tariffId: number): Observable<TariffCharge[]> {
    return this.http.get<TariffCharge[]>(`${this.baseUrl}/${tariffId}/charges`);
  }

  saveCharge(tariffId: number,  tariffCharge: TariffCharge): Observable<TariffCharge> {
    return this.http.post<TariffCharge>(`${this.baseUrl}/${tariffId}/charge`, tariffCharge);
  }

  updateCharge(tariffId: number, chargeId: number, tariffCharge: TariffCharge): Observable<TariffCharge> {
    return this.http.put<TariffCharge>(`${this.baseUrl}/${tariffId}/charge/${chargeId}`, tariffCharge);
  }
}
