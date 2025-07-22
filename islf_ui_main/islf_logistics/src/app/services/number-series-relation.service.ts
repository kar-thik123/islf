import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NumberSeriesRelation {
  id: number;
  numberSeries: string;
  startingDate: Date;
  startingNo: number;
  endingNo: number;
  prefix: string;
  lastNoUsed: number;
  incrementBy: number;
  is_editing? :boolean;
  is_new? :boolean;
  // Add other fields as needed
}

@Injectable({ providedIn: 'root' })
export class NumberSeriesRelationService {
  private apiUrl = '/api/number_relation';
  private numberSeriesApiUrl = '/api/number_series';

  constructor(private http: HttpClient) {}

  getAll(): Observable<NumberSeriesRelation[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(data => data.map(item => ({
        id: item.id,
        numberSeries: item.number_series,
        startingDate: item.starting_date,
        startingNo: item.starting_no,
        endingNo: item.ending_no,
        prefix: item.prefix,
        lastNoUsed: item.last_no_used,
        incrementBy: item.increment_by
      })))
    );
  }

  getById(id: number): Observable<NumberSeriesRelation> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(item => ({
        id: item.id,
        numberSeries: item.number_series,
        startingDate: item.starting_date,
        startingNo: item.starting_no,
        endingNo: item.ending_no,
        prefix: item.prefix,
        lastNoUsed: item.last_no_used,
        incrementBy: item.increment_by
      }))
    );
  }

  create(relation: NumberSeriesRelation): Observable<NumberSeriesRelation> {
    return this.http.post<NumberSeriesRelation>(this.apiUrl, relation);
  }

  update(id: number, relation: NumberSeriesRelation): Observable<NumberSeriesRelation> {
    return this.http.put<NumberSeriesRelation>(`${this.apiUrl}/${id}`, relation);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // For dropdown: get all number series codes
  getNumberSeriesCodes(): Observable<{ label: string, value: string }[]> {
    return this.http.get<any[]>(this.numberSeriesApiUrl).pipe(
      map(series => series.map(s => ({ label: s.code, value: s.code })))
    );
  }

  getNumberSeriesList(): Observable<string[]> {
    return this.http.get<string[]>(this.apiUrl + '/series/list');
  }
} 