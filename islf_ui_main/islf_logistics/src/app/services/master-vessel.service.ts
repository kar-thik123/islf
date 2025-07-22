import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MasterVessel {
  id?: number;
  code: string;
  vessel_name: string;
  flag: string;
  year_build: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class MasterVesselService {
  private apiUrl = `${environment.apiUrl}/api/master_vessel`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<MasterVessel[]> {
    return this.http.get<MasterVessel[]>(this.apiUrl);
  }

  create(data: MasterVessel): Observable<MasterVessel> {
    return this.http.post<MasterVessel>(this.apiUrl, data);
  }

  update(id: number, data: Partial<MasterVessel>): Observable<MasterVessel> {
    return this.http.put<MasterVessel>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
} 