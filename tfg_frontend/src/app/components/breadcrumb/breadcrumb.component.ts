import { Component, Input } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';

export interface Breadcrumb {
  label?: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [BreadcrumbModule],
  template: `<p-breadcrumb [model]="items" [home]="home"></p-breadcrumb>`,
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  @Input() items: Breadcrumb[] = [];
  @Input() home: Breadcrumb = { label: 'Home', url: '/' };
}
