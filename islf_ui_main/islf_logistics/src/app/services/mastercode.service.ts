import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MasterCodeService {
  private apiUrl = `${environment.apiUrl}/api/masters`;

  constructor(private http: HttpClient) {}

  // 🔄 Get all master records
  getMasters(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // ✅ Update status (Active/Inactive)
  updateMasterStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  // ✏️ Get a single master record by ID (for edit)
  getMasterById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // 💾 Create a new master entry
  createMaster(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // 🔁 Update existing master entry
  updateMaster(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // ❌ Delete master entry
  deleteMaster(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
