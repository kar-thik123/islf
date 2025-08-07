import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';

export interface MasterItem {
  id?: number;
  item_type: string;
  code: string;
  name: string;
  hs_code: string;
  active: boolean;
}

@Injectable({ providedIn: 'root' })
export class MasterItemService {
  private apiUrl = `${environment.apiUrl}/api/master_item`;

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService) {}

  getAll(): Observable<MasterItem[]> {
    return this.http.get<MasterItem[]>(this.apiUrl);
  }

  create(data: MasterItem): Observable<MasterItem> {
    return this.http.post<MasterItem>(this.apiUrl, this.contextPayload.withContext(data));
  }

  update(id: number, data: Partial<MasterItem>): Observable<MasterItem> {
    return this.http.put<MasterItem>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
