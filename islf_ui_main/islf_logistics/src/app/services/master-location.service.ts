import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

export interface MasterLocation {
  id?: number;
  type: string;
  code: string;
  name: string;
  country: string;
  state: string;
  city: string;
  gst_state_code: string;
  pin_code: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class MasterLocationService {
  private apiUrl = `${environment.apiUrl}/api/master_location`;

  constructor(
    private http: HttpClient, 
    private contextPayload: ContextPayloadService, 
    private contextService: ContextService
  ) {}

  // 🔄 Updated getAll method to match UOM pattern (unconditional context sending)
  getAll(): Observable<any[]> {
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
    
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  create(data: MasterLocation): Observable<MasterLocation> {
    return this.http.post<MasterLocation>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(code: string, data: Partial<MasterLocation>): Observable<MasterLocation> {
    return this.http.put<MasterLocation>(`${this.apiUrl}/${code}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }
}