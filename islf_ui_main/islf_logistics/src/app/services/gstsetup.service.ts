import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

export interface GstRule {
  id?: number;
  from?: string;
  to?: string;
  sgst?: boolean;
  cgst?: boolean;
  igst?: boolean;
}

@Injectable({ providedIn: 'root' })
export class GstSetupService {
  private apiUrl = `${environment.apiUrl}/api/gst_setup`;

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) { }

  // 🔄 Updated getAll method to respect IT Setup validation/filter settings
  getAll(): Observable<GstRule[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const filter = config?.validation?.gstsetupFilter || '';

    const params: any = {};

    if (filter.includes('C') && context.companyCode) {
      params.companyCode = context.companyCode;
    }
    if (filter.includes('B') && context.branchCode) {
      params.branchCode = context.branchCode;
    }
    if (filter.includes('D') && context.departmentCode) {
      params.departmentCode = context.departmentCode;
    }

    return this.http.get<GstRule[]>(this.apiUrl, { params });
  }

  create(data: GstRule): Observable<GstRule> {
    return this.http.post<GstRule>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(id: number, data: GstRule): Observable<GstRule> {
    return this.http.put<GstRule>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}