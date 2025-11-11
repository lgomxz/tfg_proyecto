// src/app/components/form/validation.service.ts
import { Injectable } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { FormInputType } from './form';

@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  // Devuelve una lista de validadores según la configuración del campo
  getValidators(field: any): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.mandatory) {
      validators.push(Validators.required);
    }
    // Aplica validadores adicionales según el tipo de campo
    switch (field.type) {
      case FormInputType.EMAIL:
        validators.push(Validators.email);
        break;
      case FormInputType.NUMBER:
        validators.push(Validators.pattern(/^\d+$/)); // Aplicar solo a campos de tipo NUMERO
        break;
    }

    return validators;
  }
}
