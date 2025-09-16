import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

export interface MasterItem {
  id?: number;
  item_type: string;
  code: string;
  name: string;
  hs_code: string;
  active: boolean;
  cargo_type?: string;
  charge_type?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class MasterItemService {
  private apiUrl = `${environment.apiUrl}/api/master_item`;

  constructor(
    private http: HttpClient, 
    private contextPayload: ContextPayloadService, 
    private contextService: ContextService
  ) {}

  // 🔄 Updated getAll method to match UOM pattern (unconditional context sending)
  getAll(): Observable<MasterItem[]> {
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
    
    return this.http.get<MasterItem[]>(this.apiUrl, { params });
  }

  create(data: MasterItem): Observable<MasterItem> {
    return this.http.post<MasterItem>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(id: number, data: Partial<MasterItem>): Observable<MasterItem> {
    return this.http.put<MasterItem>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
