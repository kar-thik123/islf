import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

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

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService, private contextService: ContextService) {}

  getAll(): Observable<Vendor[]> {
    return this.http.get<Vendor[]>(this.apiUrl);
  }

  create(data: Partial<Vendor> & { seriesCode?: string }): Observable<Vendor> {
    return this.http.post<Vendor>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(id: number, data: Partial<Vendor>): Observable<Vendor> {
    return this.http.put<Vendor>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 