import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CarriageDirection {
  id?: number;
  carriage: string;
  is_from: boolean;
  is_to: boolean;
  description?: string;
}

export interface EnquiryCarriageMapRow {
  id?: number;
  enquiry_id: number;
  direction: 'FROM' | 'TO';
  carriage: string;
  location_type?: string;
  location?: string;
}

@Injectable({ providedIn: 'root' })
export class CarriageService {
  private settingsUrl = `${environment.apiUrl}/api/settings`;
  private enquiryUrl = `${environment.apiUrl}/api/enquiry`;

  constructor(private http: HttpClient) {}

  getCarriageDirection(): Observable<CarriageDirection[]> {
    return this.http.get<CarriageDirection[]>(`${this.settingsUrl}/carriage-direction`);
  }

  saveCarriageDirection(list: CarriageDirection[]): Observable<any> {
    return this.http.post(`${this.settingsUrl}/carriage-direction/save`, list);
  }

  getEnquiryCarriageMapping(enquiryId: number): Observable<EnquiryCarriageMapRow[]> {
    return this.http.get<EnquiryCarriageMapRow[]>(`${this.enquiryUrl}/${enquiryId}/carriage-mapping`);
  }

  saveEnquiryCarriageMapping(enquiryId: number, list: Partial<EnquiryCarriageMapRow>[]): Observable<any> {
    return this.http.post(`${this.enquiryUrl}/carriage-mapping/save`, { enquiry_id: enquiryId, list });
  }
}