import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PasswordModule } from 'primeng/password';
import { CommonModule } from '@angular/common';

import { CollectionFormConfig } from './form';
import { ValidationService } from './validation.service';
import zxcvbn from 'zxcvbn';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    InputTextareaModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    PasswordModule,
    CommonModule,
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnChanges {
  // Configuración de la estructura del formulario (campos)
  @Input() formConfig!: CollectionFormConfig[];
  // Instancia de formulario reactivo
  @Input() form!: FormGroup;
  @Input() comparisonResults: { [key: string]: 'correct' | 'incorrect' } = {};

  // Evento para abrir el atlas
  @Output() openAtlas = new EventEmitter<string>();

  @Input() formSubmitted: boolean = false;
  @Input() currentMode: string = 'labelling';

  // Etiquetas de texto según la puntuación de zxcvbn
  private strengthLabels: { [score: number]: string } = {
    0: 'Very Weak',
    1: 'Very Weak',
    2: 'Weak',
    3: 'Good',
    4: 'Strong',
  };
  // Clases CSS para mostrar visualmente la fuerza
  private strengthClasses: { [score: number]: string } = {
    0: 'strength-very-weak',
    1: 'strength-very-weak',
    2: 'strength-weak',
    3: 'strength-good',
    4: 'strength-strong',
  };

  passwordStrength: { [key: string]: { label: string; score: number } } = {};
  private passwordSubscriptions: { [key: string]: any } = {};

  constructor(
    private fb: FormBuilder,
    private validationService: ValidationService
  ) {}

  // Crea los FormControls basándose en la configuración del formulario
  private createFormControls(config: CollectionFormConfig[]): {
    [key: string]: FormControl;
  } {
    const controls: { [key: string]: FormControl } = {};

    config.forEach(group => {
      group.child.forEach(field => {
        const validators = this.validationService.getValidators(field);
        controls[field.apiField] = new FormControl(
          field.value || '',
          validators
        );
      });
    });

    return controls;
  }

  // Permite reconstruir el formulario cuando cambia la configuración
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formConfig'] && this.formConfig?.length) {
      if (this.form) {
        // El formulario viene del padre -> solo aseguramos que tenga los controles
        const controls = this.createFormControls(this.formConfig);
        Object.keys(controls).forEach(key => {
          if (!this.form.contains(key)) {
            this.form.addControl(key, controls[key]);
          }
        });
      } else {
        // Si por alguna razón no vino del padre, se crea localmente
        this.form = this.fb.group(this.createFormControls(this.formConfig));
      }

      this.setupControlBehavior();
    }
  }

  /**
   * Configura el comportamiento especial de ciertos controles:
   * - Deshabilita campos de solo lectura.
   * - Mide la fuerza de contraseñas en tiempo real.
   */
  private setupControlBehavior(): void {
    // Limpiar suscripciones anteriores
    Object.values(this.passwordSubscriptions).forEach(sub =>
      sub?.unsubscribe?.()
    );
    this.passwordSubscriptions = {};

    this.formConfig.forEach(group => {
      group.child.forEach(field => {
        const control = this.form.get(field.apiField);
        if (!control) return;

        // Deshabilita campos de solo lectura
        if (field.readOnly === true) {
          control.disable();
        }

        if (field.type === 'password' && field.showPasswordStrengthMeter) {
          const sub = control.valueChanges.subscribe(password => {
            this.evaluatePasswordStrength(password, field.apiField);
          });
          this.passwordSubscriptions[field.apiField] = sub;
        }
      });
    });
  }

  // Evalúa la fortaleza de una contraseña usando zxcvbn y guarda el resultado
  evaluatePasswordStrength(password: string, fieldId: string): void {
    if (typeof password !== 'string' || password.trim() === '') {
      this.passwordStrength[fieldId] = { score: 0, label: '' };
      return;
    }

    const result = zxcvbn(password);
    this.passwordStrength[fieldId] = {
      score: result.score,
      label: this.getStrengthLabel(result.score),
    };
  }

  getStrengthLabel(score: number): string {
    return this.strengthLabels[score] || '';
  }

  getPasswordStrengthClass(score: number): string {
    return this.strengthClasses[score] || '';
  }

  getInputWidth(width?: string) {
    return width ? { [width]: true } : null;
  }

  onDropdownChange(apiField: string) {
    this.form.get(apiField);
  }

  onOpenAtlas(fieldId: string) {
    this.openAtlas.emit(fieldId);
  }

  /**
   * Devuelve una clase CSS según el estado del campo:
   * - 'correct': verde si la respuesta es correcta (modo training)
   * - 'invalid': rojo si es incorrecta o inválida
   */
  getFieldClass(fieldId: string): string {
    const control = this.form.get(fieldId);
    if (!control) return '';

    if (this.currentMode === 'training') {
      const comparison = this.comparisonResults?.[fieldId];

      if (comparison === 'correct') {
        // Clase verde + parpadeo
        setTimeout(() => {
          const field = document.getElementById(fieldId);
          if (field) field.classList.add('persistent');
        }, 100);
        return 'correct';
      }

      if (comparison === 'incorrect') {
        // Clase roja + parpadeo
        setTimeout(() => {
          const field = document.getElementById(fieldId);
          if (field) field.classList.add('persistent');
        }, 100);
        return 'invalid';
      }

      return '';
    }

    if (control.invalid && this.formSubmitted) {
      setTimeout(() => {
        const field = document.getElementById(fieldId);
        if (field) field.classList.add('persistent');
      }, 1000);
      return 'invalid';
    }

    return '';
  }

  // Previene que los campos de solo lectura puedan enfocarse
  preventFocus(event: FocusEvent, readOnly: boolean) {
    if (readOnly) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
