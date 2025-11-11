import { ComponentRef, Injectable } from '@angular/core';
import { CcbToastComponent } from './toast.component';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { MessageService } from 'primeng/api';
import { ComponentPortal } from '@angular/cdk/portal';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastConfig } from './toast';

@UntilDestroy()
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  componentRef!: ComponentRef<CcbToastComponent>;
  private overlayRef!: OverlayRef;

  private incrementalIndex = 0;

  private toastList: ToastConfig[] = [];

  constructor(
    private overlay: Overlay,
    private messageService: MessageService
  ) {}

  private initOverlay() {
    const overlayConfig = new OverlayConfig({
      hasBackdrop: false,
      positionStrategy: this.overlay.position().global().top('0').right('0'),
    });
    this.overlayRef = this.overlay.create(overlayConfig);
    const portal = new ComponentPortal(CcbToastComponent);
    this.componentRef = this.overlayRef.attach(portal);
    this.componentRef.instance.closeEvent$
      .pipe(untilDestroyed(this))
      .subscribe(index => {
        this.removeToast(index);
      });
  }

  private addToast(toastData: ToastConfig) {
    if (!this.componentRef) {
      this.initOverlay();
    }
    this.incrementalIndex += 1;
    toastData.id = this.incrementalIndex;

    //! Buscar una mejora
    setTimeout(() => {
      this.messageService.add({
        id: toastData.id,
        severity: toastData.severity,
        summary: toastData.summary,
        detail: toastData.detail,
        life: 2000,
      });
    }, 100);

    this.toastList.push(toastData);
  }

  private removeToast(index?: number): void {
    if (!this.componentRef) return;
    this.toastList = this.toastList.filter(t => t.id !== index);

    if (this.toastList.length === 0) {
      this.incrementalIndex = 0;
      this.componentRef = this.overlayRef.detach();
    }
  }

  show(toastData: ToastConfig): void {
    this.addToast(toastData);
  }
}
