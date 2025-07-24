import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GstRule {
  id?: number;
  from?: string;
  to?: string;
  sgst?: boolean;
  cgst?: boolean;
  igst?: boolean;
}

@Injectable({ providedIn: 'root' })
export class GstSetupService {
  private apiUrl = `${environment.apiUrl}/api/gst_setup`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<GstRule[]> {
    return this.http.get<GstRule[]>(this.apiUrl);
  }

  create(data: GstRule): Observable<GstRule> {
    return this.http.post<GstRule>(this.apiUrl, data);
  }

  update(id: number, data: GstRule): Observable<GstRule> {
    return this.http.put<GstRule>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 