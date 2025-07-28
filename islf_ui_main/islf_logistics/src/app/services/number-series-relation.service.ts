import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface NumberSeriesRelation {
  id: number;
  numberSeries: string;
  startingDate: Date | null;
  startingNo: number;
  endingNo: number;
  endingDate?: Date | null; // New field for ending date
  prefix: string;
  lastNoUsed: number;
  incrementBy: number;
  is_editing? :boolean;
  is_new? :boolean;
  // Add other fields as needed
}

// Interface for backend payload (with string dates)
export interface NumberSeriesRelationPayload {
  id: number;
  numberSeries: string;
  startingDate: string | null;
  startingNo: number;
  endingNo: number;
  endingDate?: string | null;
  prefix: string;
  lastNoUsed: number;
  incrementBy: number;
  is_editing? :boolean;
  is_new? :boolean;
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
        startingDate: item.starting_date ? new Date(item.starting_date) : null,
        startingNo: item.starting_no,
        endingNo: item.ending_no,
        endingDate: item.ending_date ? new Date(item.ending_date) : null,
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
        startingDate: item.starting_date ? new Date(item.starting_date) : null,
        startingNo: item.starting_no,
        endingNo: item.ending_no,
        endingDate: item.ending_date ? new Date(item.ending_date) : null,
        prefix: item.prefix,
        lastNoUsed: item.last_no_used,
        incrementBy: item.increment_by
      }))
    );
  }

  create(relation: NumberSeriesRelation): Observable<NumberSeriesRelation> {
    // Convert dates to proper format for backend
    const payload = this.convertDatesForBackend(relation);
    return this.http.post<NumberSeriesRelation>(this.apiUrl, payload);
  }

  update(id: number, relation: NumberSeriesRelation): Observable<NumberSeriesRelation> {
    // Convert dates to proper format for backend
    const payload = this.convertDatesForBackend(relation);
    return this.http.put<NumberSeriesRelation>(`${this.apiUrl}/${id}`, payload);
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

  // Helper method to convert dates for backend storage
  private convertDatesForBackend(relation: NumberSeriesRelation): NumberSeriesRelationPayload {
    const payload: NumberSeriesRelationPayload = {
      id: relation.id,
      numberSeries: relation.numberSeries,
      startingDate: relation.startingDate ? new Date(relation.startingDate).toISOString() : null,
      startingNo: relation.startingNo,
      endingNo: relation.endingNo,
      endingDate: relation.endingDate ? (() => {
        const date = new Date(relation.endingDate!);
        // Ensure the date is treated as local time and converted to UTC
        const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return utcDate.toISOString();
      })() : null,
      prefix: relation.prefix,
      lastNoUsed: relation.lastNoUsed,
      incrementBy: relation.incrementBy,
      is_editing: relation.is_editing,
      is_new: relation.is_new
    };
    
    return payload;
  }
} 