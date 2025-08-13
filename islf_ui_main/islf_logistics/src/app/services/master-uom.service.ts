import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

export interface MasterUOM {
  id?: number;
  uom_type: string;
  code: string;
  description: string;
  // start_day: string;
  // end_day: string;
  // working_days: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class MasterUOMService {
  private apiUrl = `${environment.apiUrl}/api/master_uom`;

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService, private contextService: ContextService) {}

  getAll(): Observable<MasterUOM[]> {
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
    
    return this.http.get<MasterUOM[]>(this.apiUrl, { params });
  }

  create(data: MasterUOM): Observable<MasterUOM> {
    return this.http.post<MasterUOM>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(id: number, data: Partial<MasterUOM>): Observable<MasterUOM> {
    return this.http.put<MasterUOM>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
