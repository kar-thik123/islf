import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

export interface CustomerContact {
  name: string;
  department: string;
  mobile: string;
  landline: string;
  email: string;
  remarks: string;
}

export interface Customer {
  id?: number;
  customer_no: string;
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
  bill_to_customer_name: string;
  vat_gst_no: string;
  place_of_supply: string;
  pan_no: string;
  tan_no: string;
  contacts: CustomerContact[];
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private apiUrl = `${environment.apiUrl}/api/customer`;

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) {}

  getAll(): Observable<Customer[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig(); // Get current config to check validation settings
    const customerFilter = config?.validation?.customerFilter || '';
    
    let params: any = {};
    
    // Only send context parameters based on the IT setup validation/filter settings
    if (customerFilter.includes('C') && context.companyCode) {
      params.company_code = context.companyCode;
    }
    if (customerFilter.includes('B') && context.branchCode) {
      params.branch_code = context.branchCode;
    }
    if (customerFilter.includes('D') && context.departmentCode) {
      params.department_code = context.departmentCode;
    }
    if (customerFilter.includes('ST') && context.serviceType) {
      params.service_type_code = context.serviceType;
    }
    
    return this.http.get<Customer[]>(this.apiUrl, { params });
  }

  create(data: Partial<Customer> & { seriesCode?: string }): Observable<Customer> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const customerFilter = config?.validation?.customerFilter || '';
    
    // Add serviceType to context if needed
    const contextWithServiceType = {
      ...context,
      serviceType: customerFilter.includes('ST') ? context.serviceType : undefined
    };
    
    return this.http.post<Customer>(this.apiUrl, this.contextPayload.withContext(data, contextWithServiceType));
  }

  update(id: number, data: Partial<Customer>): Observable<Customer> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const customerFilter = config?.validation?.customerFilter || '';
    
    // Add serviceType to context if needed
    const contextWithServiceType = {
      ...context,
      serviceType: customerFilter.includes('ST') ? context.serviceType : undefined
    };
    
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, contextWithServiceType));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 