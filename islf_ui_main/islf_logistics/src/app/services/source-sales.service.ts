import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

export interface SourceSales {
  id?: number;
  code: string;
  name: string;
  commission_percentage: number;
  email: string;
  phone: string;
  status?: string;
  context_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SourceSalesService {

  private apiUrl = `${environment.apiUrl}/api/source_sales`;

  constructor(
    private http: HttpClient,
    private contextPayloadService: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) {}

  getSourceSales(): Observable<SourceSales[]> {
    // Always filter by the currently selected context when available
    const context = this.contextService.getContext();
    const params: any = {};

    if (context.companyCode) params.company_code = context.companyCode;
    if (context.branchCode) params.branch_code = context.branchCode;
    if (context.departmentCode) params.department_code = context.departmentCode;
    if (context.serviceType) params.service_type_code = context.serviceType;

    return this.http.get<SourceSales[]>(this.apiUrl, { params });
  }

  getSourceSalesById(id: number): Observable<SourceSales> {
    return this.http.get<SourceSales>(`${this.apiUrl}/${id}`);
  }

  createSourceSales(sourceSales: SourceSales): Observable<SourceSales> {
    const context = this.contextService.getContext();
    return this.http.post<SourceSales>(
      `${this.apiUrl}`,
      this.contextPayloadService.withContext(sourceSales, context)
    );
  }

  updateSourceSales(id: number, sourceSales: SourceSales): Observable<SourceSales> {
    const context = this.contextService.getContext();
    return this.http.put<SourceSales>(
      `${this.apiUrl}/${id}`,
      this.contextPayloadService.withContext(sourceSales, context)
    );
  }

  deleteSourceSales(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}