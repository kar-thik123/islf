import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { PermissionService } from '../services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  @Input() appHasPermission!: { module: string; subModule: string; action: 'read' | 'write' | 'delete' };

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  ngOnInit() {
    this.updateView();
  }

  private updateView() {
    let hasAccess = false;
    const { module, subModule, action } = this.appHasPermission;

    switch(action) {
      case 'read':
        hasAccess = this.permissionService.canRead(module, subModule);
        break;
      case 'write':
        hasAccess = this.permissionService.canWrite(module, subModule);
        break;
      case 'delete':
        hasAccess = this.permissionService.canDelete(module, subModule);
        break;
    }

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
