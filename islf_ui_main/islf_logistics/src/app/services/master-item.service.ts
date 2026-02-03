import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

export interface MasterItem {
  id?: number;
  item_type: string;
  code: string;
  name: string;
  hs_code: string;
  active: boolean;
  cargo_type?: string;
  charge_type?: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class MasterItemService {
  private apiUrl = `${environment.apiUrl}/api/master_item`;
  private cache: MasterItem[] | null = null;
  private lastContextKey: string = '';

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) { }

  // 🔄 Updated getAll method with in-memory caching
  getAll(): Observable<MasterItem[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const itemFilter = config?.validation?.itemFilter || '';

    const params: any = {};

    if (itemFilter.includes('C') && context.companyCode) {
      params.companyCode = context.companyCode;
    }
    if (itemFilter.includes('B') && context.branchCode) {
      params.branchCode = context.branchCode;
    }
    if (itemFilter.includes('D') && context.departmentCode) {
      params.departmentCode = context.departmentCode;
    }

    const currentContextKey = JSON.stringify(params);
    if (this.cache && this.lastContextKey === currentContextKey) {
      console.log('Returning cached items');
      return of(this.cache);
    }

    return this.http.get<MasterItem[]>(this.apiUrl, { params }).pipe(
      tap(data => {
        this.cache = data;
        this.lastContextKey = currentContextKey;
      })
    );
  }

  clearCache() {
    this.cache = null;
    this.lastContextKey = '';
  }

  create(data: MasterItem): Observable<MasterItem> {
    this.clearCache();
    return this.http.post<MasterItem>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  update(id: number, data: Partial<MasterItem>): Observable<MasterItem> {
    this.clearCache();
    return this.http.put<MasterItem>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    this.clearCache();
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
