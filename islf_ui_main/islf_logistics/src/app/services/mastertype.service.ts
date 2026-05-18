import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class MasterTypeService {
  private apiUrl = `${environment.apiUrl}/api/master_type`;

  constructor(
    private http: HttpClient,
    private contextPayload: ContextPayloadService,
    private contextService: ContextService,
    private configService: ConfigService
  ) { }

  // 🔄 Updated getAll method to respect IT Setup validation/filter settings
  getAll(): Observable<any[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const filter = config?.validation?.masterTypeFilter || '';

    const params: any = {};

    if (filter.includes('C') && context.companyCode) {
      params.companyCode = context.companyCode;
    }
    if (filter.includes('B') && context.branchCode) {
      params.branchCode = context.branchCode;
    }
    if (filter.includes('D') && context.departmentCode) {
      params.departmentCode = context.departmentCode;
    }

    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getAllByType(type: string): Observable<any[]> {
    const context = this.contextService.getContext();
    const config = this.configService.getConfig();
    const filter = config?.validation?.masterTypeFilter || '';

    const params: any = {};

    if (filter.includes('C') && context.companyCode) {
      params.companyCode = context.companyCode;
    }
    if (filter.includes('B') && context.branchCode) {
      params.branchCode = context.branchCode;
    }
    if (filter.includes('D') && context.departmentCode) {
      params.departmentCode = context.departmentCode;
    }

    return this.http.get<any[]>(`${this.apiUrl}/type/${type}`, { params });
  }

  create(type: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, this.contextPayload.withContext(type, this.contextService.getContext()));
  }

  update(id: number, type: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(type, this.contextService.getContext()));
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  getUniqueServiceAreaTypes(): Observable<any[]> {
    return this.getAll().pipe(
      // Use map from rxjs/operators, assuming it's imported or available
      // If map is not imported in the file, we should fix imports, but view_file showed tap/catchError so map might need import.
      // Wait, view_file for service didn't show imports. Let's check imports first or just add the method and imports.
      // Actually, looking at previous view_file of service:
      // import { Observable } from 'rxjs';
      // It doesn't show map/tap imports.
      // I'll assume map is needed.
      // Let's safe-bet and use a transform inside the pipe.
      // Oh wait, line 3 imports Observable but no operators?
      // Re-reading service file...
      // It uses http.get. no pipe in getAll.
      // But getAll returns Observable<any[]>.
      // I need to import map.
      map((types: any[]) => {
        const activeTypes = (types || []).filter(
          (t) =>
            t.key === 'SERVICE_AREA' &&
            (t.status === 'Active' || t.status === 'active')
        );

        const uniqueValues = new Set<string>();
        const uniqueOptions: any[] = [];

        activeTypes.forEach((t) => {
          const value = t.value;
          if (value && !uniqueValues.has(value)) {
            uniqueValues.add(value);
            uniqueOptions.push({
              label: t.value,
              value: t.value,
            });
          }
        });

        return uniqueOptions.sort((a, b) => a.label.localeCompare(b.label));
      })
    );
  }
}