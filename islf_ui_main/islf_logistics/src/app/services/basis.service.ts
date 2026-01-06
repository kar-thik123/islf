import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

export interface Basis {
  id?: number;
  code: string;
  description: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class BasisService {
  private apiUrl = `${environment.apiUrl}/api/basis`;

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) { }

  getAll(skipLoading = false): Observable<Basis[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const basisFilter = config?.validation?.basisFilter || '';

    let params: any = {};

    // Only send context parameters based on the IT setup validation/filter settings
    if (basisFilter.includes('C') && context.companyCode) {
      params.companyCode = context.companyCode;  // Changed from company_code
    }
    if (basisFilter.includes('B') && context.branchCode) {
      params.branchCode = context.branchCode;    // Changed from branch_code
    }
    if (basisFilter.includes('D') && context.departmentCode) {
      params.departmentCode = context.departmentCode;  // Changed from department_code
    }

    const headers: any = {};
    if (skipLoading) {
      headers['X-Skip-Loading'] = 'true';
    }

    return this.http.get<Basis[]>(this.apiUrl, { params, headers });
  }

  create(data: Partial<Basis>, skipLoading = false): Observable<Basis> {
    const context = this.contextService.getContext();
    const headers: any = {};
    if (skipLoading) {
      headers['X-Skip-Loading'] = 'true';
    }
    return this.http.post<Basis>(this.apiUrl, this.contextPayload.withContext(data, context), { headers });
  }

  update(id: string, data: Partial<Basis>, skipLoading = false): Observable<Basis> {
    console.log("DEBUG Update Basis called with id: ", id, " and data: ", data);
    const context = this.contextService.getContext();
    const headers: any = {};
    if (skipLoading) {
      headers['X-Skip-Loading'] = 'true';
    }
    return this.http.put<Basis>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, context), { headers });
  }

  delete(id: number, skipLoading = false): Observable<any> {
    const headers: any = {};
    if (skipLoading) {
      headers['X-Skip-Loading'] = 'true';
    }
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  // Backward compatibility methods
  getBasis(): Observable<Basis[]> {
    return this.getAll();
  }

  createBasis(data: any): Observable<Basis> {
    return this.create(data);
  }

  updateBasis(id: string, data: any, skipLoading = false): Observable<Basis> {
    return this.update(id, data, skipLoading);
  }

  deleteBasis(id: string): Observable<any> {
    return this.delete(Number(id));
  }
}