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
  from: string;
  to: string;
  partyType: string;
  partyName: string;
  charges: number;
  freightChargeType: string;
  effectiveDate: string;
  periodStartDate: string;
  periodEndDate: string;
}

@Injectable({ providedIn: 'root' })
export class TariffService {
  private baseUrl = '/api/tariff';

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService, private contextService: ContextService) {}

  getAll(): Observable<Tariff[]> {
    return this.http.get<Tariff[]>(this.baseUrl);
  }

  create(tariff: Tariff): Observable<Tariff> {
    return this.http.post<Tariff>(this.baseUrl, this.contextPayload.withContext(tariff, this.contextService.getContext()));
  }

  update(id: number, tariff: Tariff): Observable<Tariff> {
    return this.http.put<Tariff>(`${this.baseUrl}/${id}`, this.contextPayload.withContext(tariff, this.contextService.getContext()));
  }
} 