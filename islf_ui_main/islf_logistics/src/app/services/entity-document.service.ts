import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

export interface EntityDocument {
  id?: number;
  entity_type: string;
  entity_code: string;
  doc_type: string;
  document_number?: string;
  valid_from?: string;
  valid_till?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({ providedIn: 'root' })
export class EntityDocumentService {
  private apiUrl = `${environment.apiUrl}/api/entity_documents`;

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService, private contextService: ContextService) {}

  // Get all documents for an entity by code
  getByEntityCode(entityType: string, entityCode: string): Observable<EntityDocument[]> {
    return this.http.get<EntityDocument[]>(`${this.apiUrl}/${entityType}/${entityCode}`);
  }

  // Upload a new document
  uploadDocument(formData: FormData): Observable<EntityDocument> {
    const ctx = this.contextService.getContext();
    if (ctx.companyCode) formData.set('companyCode', ctx.companyCode);
    if (ctx.branchCode) formData.set('branchCode', ctx.branchCode);
    if (ctx.departmentCode) formData.set('departmentCode', ctx.departmentCode);
    return this.http.post<EntityDocument>(`${this.apiUrl}/upload`, formData);
  }

  // Update document metadata
  update(id: number, data: Partial<EntityDocument>): Observable<EntityDocument> {
    return this.http.put<EntityDocument>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  // Delete document
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Download document
  download(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${id}`, { responseType: 'blob' });
  }

  // View document (for viewing in browser)
  view(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/view/${id}`, { responseType: 'blob' });
  }

  // Get document upload path for specific entity type from settings
  getUploadPath(entityType: string): Observable<{ value: string }> {
    return this.http.get<{ value: string }>(`${environment.apiUrl}/api/settings/document_upload_path_${entityType}`);
  }
} 