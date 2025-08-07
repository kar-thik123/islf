import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';

export interface MasterUOM {
  id?: number;
  uom_type: string;
  code: string;
  description: string;
  // start_day: string;
  // end_day: string;
  // working_days: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class MasterUOMService {
  private apiUrl = `${environment.apiUrl}/api/master_uom`;

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService) {}

  getAll(): Observable<MasterUOM[]> {
    return this.http.get<MasterUOM[]>(this.apiUrl);
  }

  create(data: MasterUOM): Observable<MasterUOM> {
    return this.http.post<MasterUOM>(this.apiUrl, this.contextPayload.withContext(data));
  }

  update(id: number, data: Partial<MasterUOM>): Observable<MasterUOM> {
    return this.http.put<MasterUOM>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
