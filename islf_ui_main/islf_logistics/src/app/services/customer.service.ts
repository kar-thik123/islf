import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

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

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService, private contextService: ContextService) {}

  getAll(): Observable<Customer[]> {
    const context = this.contextService.getContext();
    let params: any = {};
    
    if (context.companyCode) {
      params.company_code = context.companyCode;
    }
    if (context.branchCode) {
      params.branch_code = context.branchCode;
    }
    if (context.departmentCode) {
      params.department_code = context.departmentCode;
    }
    if(context.serviceType) {
      params.service_type = context.serviceType;  
    }
    
    return this.http.get<Customer[]>(this.apiUrl, { params });
  }

  create(data: Partial<Customer> & { seriesCode?: string }): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(id: number, data: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 