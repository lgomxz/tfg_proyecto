import { Component } from '@angular/core';
import { ToastCloseEvent, ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [ToastModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class CcbToastComponent {
  closeEvent$ = new Subject<number | undefined>();

  onClose(event: ToastCloseEvent) {
    this.closeEvent$.next(event.message.id);
  }
}
