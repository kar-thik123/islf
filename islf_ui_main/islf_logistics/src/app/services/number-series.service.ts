import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';
import { map } from 'rxjs/operators';

export interface NumberSeries {
  id?: number;
  code: string;
  description: string;
  basecode: string;
  is_default: boolean;
  is_manual: boolean;
  is_primary: boolean;
  isEditing?: boolean;
  isNew?: boolean;
  has_used_relation?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NumberSeriesService {
  private apiUrl = `${environment.apiUrl}/api/number_series`;

  constructor(
    private http: HttpClient, 
    private contextPayload: ContextPayloadService, 
    private contextService: ContextService,
    private configService: ConfigService
  ) {}

  // Updated getAll method with context-based filtering
  getAll(): Observable<NumberSeries[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const numberSeriesFilter = config?.validation?.numberSeriesFilter || '';
    
    let params: any = {};
    
    // Only send context parameters based on the validation/filter settings
    if (numberSeriesFilter.includes('C') && context.companyCode) {
      params.companyCode = context.companyCode;
    }
    if (numberSeriesFilter.includes('B') && context.branchCode) {
      params.branchCode = context.branchCode;
    }
    if (numberSeriesFilter.includes('D') && context.departmentCode) {
      params.departmentCode = context.departmentCode;
    }
    
    return this.http.get<NumberSeries[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<NumberSeries> {
    return this.http.get<NumberSeries>(`${this.apiUrl}/${id}`);
  }

  create(series: NumberSeries): Observable<NumberSeries> {
    return this.http.post<NumberSeries>(this.apiUrl, this.contextPayload.withContext(series, this.contextService.getContext()));
  }

  update(id: number, series: NumberSeries): Observable<NumberSeries> {
    return this.http.put<NumberSeries>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(series, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
