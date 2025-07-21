import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MasterLocation {
  id?: number;
  type: string;
  code: string;
  name: string;
  country: string;
  state: string;
  city: string;
  gst_state_code: string;
  pin_code: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class MasterLocationService {
  private apiUrl = `${environment.apiUrl}/api/master_location`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MasterLocation[]> {
    return this.http.get<MasterLocation[]>(this.apiUrl);
  }

  create(data: MasterLocation): Observable<MasterLocation> {
    return this.http.post<MasterLocation>(this.apiUrl, data);
  }

  update(code: string, data: Partial<MasterLocation>): Observable<MasterLocation> {
    return this.http.put<MasterLocation>(`${this.apiUrl}/${code}`, data);
  }

  delete(code: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${code}`);
  }
} 