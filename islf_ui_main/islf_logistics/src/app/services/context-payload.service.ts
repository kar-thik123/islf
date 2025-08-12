import { Injectable } from '@angular/core';
import { UserContext } from './context.service';

@Injectable({ providedIn: 'root' })
export class ContextPayloadService {
  constructor() {}

  withContext<T extends object>(payload: T, context: UserContext): T & {
    companyCode?: string;
    branchCode?: string;
    departmentCode?: string;
    serviceType?: string | null;
  } {
    return {
      ...payload,
      companyCode: context.companyCode,
      branchCode: context.branchCode,
      departmentCode: context.departmentCode,
      serviceType: context.serviceType
    };
  }
}
