import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

@Injectable()
export abstract class BaseMasterService<T extends object> {
  protected abstract apiUrl: string;

  constructor(
    protected http: HttpClient,
    protected contextPayload: ContextPayloadService,
    protected contextService: ContextService
  ) {}

  // Common method for context-aware getAll
  getAll(): Observable<T[]> {
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
    
    return this.http.get<T[]>(this.apiUrl, { params });
  }

  create(data: T): Observable<T> {
    return this.http.post<T>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(id: string | number, data: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Method for services that use different parameter names
  getById(id: string | number): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${id}`);
  }

  // Method for status updates
  updateStatus(id: string | number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, this.contextPayload.withContext({ status }, this.contextService.getContext()));
  }
}