import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

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

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService, private contextService: ContextService) {}

  getMapping(): Observable<Mapping> {
    return this.http.get<Mapping>(this.apiUrl);
  }

  saveMapping(mapping: Mapping): Observable<any> {
    return this.http.post(this.apiUrl, this.contextPayload.withContext(mapping, this.contextService.getContext()));
  }

  // Mapping Relations CRUD operations
  getMappingRelations(): Observable<MappingRelation[]> {
    return this.http.get<MappingRelation[]>(`${this.apiUrl}/relations`);
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