import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Incharge {
  id?: number;
  entity_type: string;
  entity_code: string;
  incharge_name: string;
  phone_number?: string;
  email?: string;
  status: 'active' | 'inactive';
  from_date: string;
  to_date?: string;
  created_at?: string;
  updated_at?: string;
  din_pan?: string;
  designation?: string;
  appointment_date?: string;
  cessation_date?: string;
  signatory?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InchargeService {
  private apiUrl = `${environment.apiUrl}/api/incharge`;

  constructor(private http: HttpClient) { }

  // Get all incharge records for an entity
  getByEntity(entityType: string, entityCode: string): Observable<Incharge[]> {
    return this.http.get<Incharge[]>(`${this.apiUrl}/${entityType}/${entityCode}`);
  }

  // Get active incharge for an entity
  getActiveIncharge(entityType: string, entityCode: string): Observable<Incharge | null> {
    return this.http.get<Incharge | null>(`${this.apiUrl}/${entityType}/${entityCode}/active`);
  }

  // Create new incharge
  create(incharge: Incharge): Observable<Incharge> {
    return this.http.post<Incharge>(this.apiUrl, incharge);
  }

  // Update incharge
  update(id: number, incharge: Partial<Incharge>): Observable<Incharge> {
    return this.http.put<Incharge>(`${this.apiUrl}/${id}`, incharge);
  }

  // Delete incharge
  delete(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }
}