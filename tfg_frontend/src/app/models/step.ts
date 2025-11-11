import { TemplateRef, Type } from '@angular/core';
import { PubisLabel } from './pubis-label.model';

export interface WizardContext {
  selectedRows: any[];
  selectedLabels: PubisLabel[];
  selectedOption: string | null;
}

export interface Step {
  title: string;
  component?: Type<any>; // componente para cargar
  data?: any; // inputs para el componente
  content?: TemplateRef<any>; // html o texto simple para mostrar
  canAdvance?: (ctx: WizardContext) => boolean;
}
