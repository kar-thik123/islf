import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';

@Injectable({ providedIn: 'root' })
export class MasterCodeService {
  private apiUrl = `${environment.apiUrl}/api/master_code`;

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService, private contextService: ContextService) {}

  // 🔄 Get all master records
  getMasters(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // ✅ Update status (Active/Inactive)
  updateMasterStatus(code: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${code}/status`, this.contextPayload.withContext({ status }, this.contextService.getContext()));
  }

  // ✏️ Get a single master record by ID (for edit)
  getMasterById(code: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${code}`);
  }

  // 💾 Create a new master entry
  createMaster(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  // 🔁 Update existing master entry
  updateMaster(code: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${code}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  // ❌ Delete master entry
  deleteMaster(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${code}`);
  }
}
