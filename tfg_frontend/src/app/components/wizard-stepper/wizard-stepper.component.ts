import {
  Component,
  Input,
  Output,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  AfterViewInit,
  ChangeDetectorRef,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Step, WizardContext } from '../../models/step';
import { PubisLabel } from '../../models/pubis-label.model';
import { TranslateModule } from '@ngx-translate/core';

interface SelectableComponent {
  selectedRowsChange: EventEmitter<any[]>;
  selectedLabels?: PubisLabel[];
}

@Component({
  selector: 'app-wizard-stepper',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './wizard-stepper.component.html',
  styleUrls: ['./wizard-stepper.component.scss'],
})
export class WizardStepperComponent implements AfterViewInit {
  private _steps: Step[] = [];
  private componentRef!: ComponentRef<any>;

  @Output() finish = new EventEmitter<void>();
  @Input() selectedOption!: string | null;

  // selectedLabels recibidos del padre
  @Input() selectedLabels: PubisLabel[] = [];

  stepHasSelection: boolean[] = [];

  @Input() set steps(value: Step[]) {
    const isFirstInit = this._steps.length === 0;
    this._steps = value;

    if (isFirstInit) {
      this.activeStep = 0;
      this.activeStepChange.emit(this.activeStep);
    }

    if (this.container) {
      this.loadStep();
    }
  }
  get steps(): Step[] {
    return this._steps;
  }

  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() activeStepChange = new EventEmitter<number>();

  @ViewChild('stepContainer', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;

  selectedRows: any[] = [];
  activeStep = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    if (this.steps.length > 0) {
      this.loadStep();
    }
  }

  next(): void {
    if (!this.canAdvance()) return;

    if (this.activeStep < this.steps.length - 1) {
      this.activeStep++;
      this.activeStepChange.emit(this.activeStep);
      this.loadStep();
    }
  }

  prev(): void {
    if (this.activeStep > 0) {
      this.activeStep--;
      this.activeStepChange.emit(this.activeStep);
      this.loadStep();
    }
  }

  onFinish(): void {
    this.finish.emit();
  }

  private loadStep(): void {
    this.container.clear();
    const step = this.steps[this.activeStep];
    if (!step?.component) return;

    this.componentRef = this.container.createComponent(step.component);

    // Inyectamos data
    if (step.data) {
      this.injectInputs(step.data);
    }

    // Inyectamos selección global
    if (step.component.name === 'TableComponent') {
      this.componentRef.instance.selectedRows = [...this.selectedRows];
    }

    // Inyectamos labels si aplica
    this.componentRef.instance.selectedLabels = this.selectedLabels;

    // Suscribimos a los cambios emitidos por el componente
    this.handleSelectionChange(this.componentRef.instance);

    // Disparamos ngOnChanges si es necesario
    this.triggerNgOnChanges({
      ...(step.data ?? {}),
      selectedLabels: this.selectedLabels,
    });

    this.cdr.detectChanges();
  }

  private injectInputs(data: Record<string, any>): void {
    for (const [key, value] of Object.entries(data)) {
      this.componentRef.instance[key] = value;
    }
  }

  private handleSelectionChange(instance: any): void {
    const selectable = instance as SelectableComponent;

    if (selectable?.selectedRowsChange) {
      selectable.selectedRowsChange.subscribe((selected: any[]) => {
        this.selectedRows = selected;
        this.selectionChange.emit(selected);
        this.stepHasSelection[this.activeStep] = selected.length > 0;
      });
    } else {
      // Si el componente no emite selección, permitir avanzar
      this.stepHasSelection[this.activeStep] = true;
    }
  }

  canAdvance(): boolean {
    const step = this.steps[this.activeStep];
    const ctx: WizardContext = {
      selectedRows: this.selectedRows,
      selectedLabels: this.selectedLabels,
      selectedOption: this.selectedOption,
    };

    // Si el step tiene su propia validación, la usamos
    if (step?.canAdvance) {
      return step.canAdvance(ctx);
    }

    // Si no define nada, por defecto no avanza
    return false;
  }

  private triggerNgOnChanges(data: Record<string, any>): void {
    if ('ngOnChanges' in this.componentRef.instance) {
      const changes = Object.fromEntries(
        Object.keys(data).map(key => [
          key,
          {
            currentValue: data[key],
            previousValue: undefined,
            firstChange: true,
            isFirstChange: () => true,
          },
        ])
      );

      this.componentRef.instance.ngOnChanges(changes);
    }
  }
}
