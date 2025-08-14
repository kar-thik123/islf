import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service'; // Add this

export interface Mapping {
  customerCode: string | null;
  vendorCode: string | null;
  employeeCode: string | null;
  customerQuote: string | null;
  invoiceNo: string | null;
  taxNo: string | null;
  jobcardNo: string | null;
  branchNo: string | null;
  departmentNo: string | null;
  vesselCode: string | null;
}

export interface MappingRelation {
  id?: number;
  codeType: string;
  mapping: string;
  company: string;
  branch: string;
  department: string;
  serviceType: string;
}

export interface MappingRelationCreate {
  codeType: string;
  mapping: string;
  companyCode: string | null;
  branchCode: string | null;
  departmentCode: string | null;
  serviceTypeCode: string | null;
}

@Injectable({ providedIn: 'root' })
export class MappingService {
  private apiUrl = `${environment.apiUrl}/api/mapping`;

  constructor(
    private http: HttpClient, 
    private contextPayload: ContextPayloadService, 
    private contextService: ContextService,
    private configService: ConfigService // Add this
  ) {}

  getMapping(): Observable<Mapping> {
    return this.http.get<Mapping>(this.apiUrl);
  }

  saveMapping(mapping: Mapping): Observable<any> {
    return this.http.post(this.apiUrl, this.contextPayload.withContext(mapping, this.contextService.getContext()));
  }

  // Mapping Relations CRUD operations
  // Update getMappingRelations to include context-based filtering
  getMappingRelations(): Observable<MappingRelation[]> {
    // Get filter configuration
    const config = this.configService.getConfig();
    const filter = config?.validation?.mappingFilter || '';
    const context = this.contextService.getContext();
    
    let params = new HttpParams();
    
    // Add context parameters based on filter configuration
    if (filter) {
      if (filter.includes('C') && context.companyCode) {
        params = params.set('companyCode', context.companyCode);
      }
      if (filter.includes('B') && context.branchCode) {
        params = params.set('branchCode', context.branchCode);
      }
      if (filter.includes('D') && context.departmentCode) {
        params = params.set('departmentCode', context.departmentCode);
      }
    }
    
    return this.http.get<MappingRelation[]>(`${this.apiUrl}/relations`, { params });
  }

  createMappingRelation(relation: MappingRelationCreate): Observable<MappingRelation> {
    return this.http.post<MappingRelation>(`${this.apiUrl}/relations`, this.contextPayload.withContext(relation, this.contextService.getContext()));
  }

  updateMappingRelation(id: number, relation: MappingRelationCreate): Observable<MappingRelation> {
    return this.http.put<MappingRelation>(`${this.apiUrl}/relations/${id}`, this.contextPayload.withContext(relation, this.contextService.getContext()));
  }

  deleteMappingRelation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/relations/${id}`);
  }

  // Find mapping relation based on context
  findMappingByContext(codeType: string, companyCode?: string, branchCode?: string, departmentCode?: string, serviceTypeCode?: string): Observable<any> {
    let params = `codeType=${codeType}`;
    if (companyCode) params += `&companyCode=${companyCode}`;
    if (branchCode) params += `&branchCode=${branchCode}`;
    if (departmentCode) params += `&departmentCode=${departmentCode}`;
    if (serviceTypeCode) params += `&serviceTypeCode=${serviceTypeCode}`;
    
    return this.http.get<any>(`${this.apiUrl}/find?${params}`);
  }
}