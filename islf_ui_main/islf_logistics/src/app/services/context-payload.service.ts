import { Injectable } from '@angular/core';
import { UserContext } from './context.service';

@Injectable({ providedIn: 'root' })
export class ContextPayloadService {
  constructor() {}

  withContext<T extends object>(payload: T, context: UserContext): T & {
    company_code?: string;
    branch_code?: string;
    department_code?: string;
  } {
    return {
      ...payload,
      company_code: context.companyCode,
      branch_code: context.branchCode,
      department_code: context.departmentCode
    };
  }
}
