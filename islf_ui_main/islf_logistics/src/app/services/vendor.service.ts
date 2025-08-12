import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

export interface VendorContact {
  name: string;
  department: string;
  mobile: string;
  landline: string;
  email: string;
  remarks: string;
}

export interface Vendor {
  id?: number;
  vendor_no: string;
  type: string;
  name: string;
  name2: string;
  blocked: boolean;
  address: string;
  address1: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  website: string;
  bill_to_vendor_name: string;
  vat_gst_no: string;
  place_of_supply: string;
  pan_no: string;
  tan_no: string;
  contacts: VendorContact[];
}

@Injectable({ providedIn: 'root' })
export class VendorService {
  private apiUrl = `${environment.apiUrl}/api/vendor`;

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) {}

  getAll(): Observable<Vendor[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const vendorFilter = config?.validation?.vendorFilter || '';
    
    let params: any = {};
    
    // Only send context parameters based on the IT setup validation/filter settings
    if (vendorFilter.includes('C') && context.companyCode) {
      params.company_code = context.companyCode;
    }
    if (vendorFilter.includes('B') && context.branchCode) {
      params.branch_code = context.branchCode;
    }
    if (vendorFilter.includes('D') && context.departmentCode) {
      params.department_code = context.departmentCode;
    }
    if (vendorFilter.includes('ST') && context.serviceType) {
      params.service_type_code = context.serviceType;
    }
    
    return this.http.get<Vendor[]>(this.apiUrl, { params });
  }

  create(data: Partial<Vendor> & { seriesCode?: string }): Observable<Vendor> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const vendorFilter = config?.validation?.vendorFilter || '';
    
    // Add serviceType to context if needed
    const contextWithServiceType = {
      ...context,
      serviceType: vendorFilter.includes('ST') ? context.serviceType : undefined
    };
    
    return this.http.post<Vendor>(this.apiUrl, this.contextPayload.withContext(data, contextWithServiceType));
  }

  update(id: number, data: Partial<Vendor>): Observable<Vendor> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const vendorFilter = config?.validation?.vendorFilter || '';
    
    // Add serviceType to context if needed
    const contextWithServiceType = {
      ...context,
      serviceType: vendorFilter.includes('ST') ? context.serviceType : undefined
    };
    
    return this.http.put<Vendor>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, contextWithServiceType));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 