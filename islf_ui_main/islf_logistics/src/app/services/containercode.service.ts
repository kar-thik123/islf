import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BaseMasterService } from './base-master.service';

@Injectable({ providedIn: 'root' })
export class ContainerCodeService extends BaseMasterService<any> {
  protected apiUrl = `${environment.apiUrl}/api/container_code`;

  // Backward compatibility methods
  getContainers() {
    return this.getAll();
  }

  createContainer(data: any) {
    return this.create(data);
  }

  updateContainer(id: string, data: any) {
    return this.update(id, data);
  }

  deleteContainer(id: string) {
    return this.delete(id);
  }
}