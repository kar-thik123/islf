import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';

export interface NumberSeries {
  id?: number;
  code: string;
  description: string;
  basecode: string;
  is_default: boolean;
  is_manual: boolean;
  is_primary: boolean;
  isEditing?: boolean;
  isNew?: boolean;
  has_used_relation?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NumberSeriesService {
  private apiUrl = `${environment.apiUrl}/api/number_series`;

  constructor(private http: HttpClient, private contextPayload: ContextPayloadService) {}

  getAll(): Observable<NumberSeries[]> {
    return this.http.get<NumberSeries[]>(this.apiUrl);
  }

  getById(id: number): Observable<NumberSeries> {
    return this.http.get<NumberSeries>(`${this.apiUrl}/${id}`);
  }

  create(series: NumberSeries): Observable<NumberSeries> {
    return this.http.post<NumberSeries>(this.apiUrl, this.contextPayload.withContext(series));
  }

  update(id: number, series: NumberSeries): Observable<NumberSeries> {
    return this.http.put<NumberSeries>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(series));
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
