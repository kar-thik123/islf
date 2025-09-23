import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { environment } from '../../environments/environment';

export interface Source {
  id?: number;
  code: string;
  mode: string;
  shippingType: string;
  basis: string;
  itemName: string;
  locationTypeFrom: string;
  locationTypeTo: string;
  from: string;
  to: string;
  currency: string;
  vendorType: string;
  vendorName: string;
  charges: number;
  effectiveDate: string;
  periodStartDate: string;
  periodEndDate: string;
  isMandatory: boolean;
    // New field for accounting purposes
}

@Injectable({ providedIn: 'root' })
export class SourceService {
  private baseUrl = `${environment.apiUrl}/api/source`;

  constructor(
    private http: HttpClient, 
    private contextPayload: ContextPayloadService, 
    private contextService: ContextService
  ) {}

  // 🔄 Updated getAll method to match UOM pattern (unconditional context sending)
  getAll(): Observable<Source[]> {
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
    
    return this.http.get<Source[]>(this.baseUrl, { params });
  }

  create(source: Source): Observable<Source> {
    return this.http.post<Source>(this.baseUrl, this.contextPayload.withContext(source, this.contextService.getContext()));
  }

  update(id: number, source: Source): Observable<Source> {
    return this.http.put<Source>(`${this.baseUrl}/${id}`, this.contextPayload.withContext(source, this.contextService.getContext()));
  }
}