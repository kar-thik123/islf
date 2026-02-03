import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ContextPayloadService } from './context-payload.service';
import { ContextService } from './context.service';
import { ConfigService } from './config.service';

export interface MasterAirline {
    id?: number;
    code: string;
    airline_name: string;
    airline_no: string;
    active: boolean | string;
    company_code?: string;
    branch_code?: string;
    department_code?: string;
    created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class MasterAirlineService {
    private apiUrl = `${environment.apiUrl}/api/master_airline`;
    private cache: MasterAirline[] | null = null;
    private lastContextKey: string = '';

    constructor(
        private http: HttpClient,
        private contextPayload: ContextPayloadService,
        private contextService: ContextService,
        private configService: ConfigService
    ) { }

    getAll(): Observable<MasterAirline[]> {
        const context = this.contextService.getContext();
        const config = this.configService.getConfig();
        const airlineFilter = config?.validation?.airlineFilter || '';

        let params: any = {};
        if (airlineFilter.includes('C') && context.companyCode) {
            params.company_code = context.companyCode;
        }
        if (airlineFilter.includes('B') && context.branchCode) {
            params.branch_code = context.branchCode;
        }
        if (airlineFilter.includes('D') && context.departmentCode) {
            params.department_code = context.departmentCode;
        }

        const currentContextKey = JSON.stringify(params);
        if (this.cache && this.lastContextKey === currentContextKey) {
            console.log('Returning cached airlines');
            return of(this.cache);
        }

        return this.http.get<MasterAirline[]>(this.apiUrl, { params }).pipe(
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

    create(data: MasterAirline): Observable<MasterAirline> {
        this.clearCache();
        return this.http.post<MasterAirline>(this.apiUrl, this.contextPayload.withContext(data, this.contextService.getContext()));
    }

    update(id: number, data: Partial<MasterAirline>): Observable<MasterAirline> {
        this.clearCache();
        return this.http.put<MasterAirline>(`${this.apiUrl}/${id}`, this.contextPayload.withContext(data, this.contextService.getContext()));
    }

    delete(id: number): Observable<any> {
        this.clearCache();
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
