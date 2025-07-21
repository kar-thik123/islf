import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MasterCodeService {
  private apiUrl = `${environment.apiUrl}/api/master_code`;

  constructor(private http: HttpClient) {}

  // 🔄 Get all master records
  getMasters(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // ✅ Update status (Active/Inactive)
  updateMasterStatus(code: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${code}/status`, { status });
  }

  // ✏️ Get a single master record by ID (for edit)
  getMasterById(code: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${code}`);
  }

  // 💾 Create a new master entry
  createMaster(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // 🔁 Update existing master entry
  updateMaster(code: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${code}`, data);
  }

  // ❌ Delete master entry
  deleteMaster(code: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${code}`);
  }
}
