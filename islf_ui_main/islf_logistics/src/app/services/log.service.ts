import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuditLogChange {
    id: number;
    audit_log_id: number;
    field_name: string;
    field_label: string;
    old_value: any;
    new_value: any;
    change_type: string;
    field_type: string;
    display_format: string;
}

export interface ActionLog {
    id: number;
    username: string;
    module_name: string;
    module_group: string;
    action: string;
    status: string;
    record_id: string;
    record_name: string;
    summary: string;
    timestamp: string;
    ip_address?: string;

    // Technical fields (optional)
    endpoint?: string;
    method?: string;
    status_code?: number;
    duration_ms?: number;
    payload?: any;
    response?: any;
    error_message?: string;

    // Loaded dynamically
    changes?: AuditLogChange[];
}

export interface ActionLogResponse {
    data: ActionLog[];
    total: number;
    page: number;
    limit: number;
}

export interface ActionLogFilters {
    moduleGroup?: string;
    moduleName?: string;
    username?: string;
    action?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

@Injectable({
    providedIn: 'root'
})
export class LogService {
    private apiUrl = '/api/audit_logs';

    constructor(private http: HttpClient) { }

    getLogs(filters: ActionLogFilters): Observable<ActionLogResponse> {
        let params = new HttpParams();

        if (filters.moduleGroup) params = params.set('moduleGroup', filters.moduleGroup);
        if (filters.moduleName) params = params.set('moduleName', filters.moduleName);
        if (filters.username) params = params.set('username', filters.username);
        if (filters.action) params = params.set('action', filters.action);
        if (filters.status) params = params.set('status', filters.status);
        if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
        if (filters.page) params = params.set('page', filters.page.toString());
        if (filters.limit) params = params.set('limit', filters.limit.toString());

        return this.http.get<ActionLogResponse>(this.apiUrl, { params });
    }

    getLogDetail(id: number): Observable<ActionLog> {
        return this.http.get<ActionLog>(`${this.apiUrl}/${id}`);
    }

    getModuleGroups(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/filters/module_groups`);
    }

    getModulesByGroup(group: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/filters/modules`, {
            params: new HttpParams().set('moduleGroup', group)
        });
    }
}
