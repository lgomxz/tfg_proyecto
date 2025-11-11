import { CollectionFormConfig } from '../form/form';

// Configuración para los botones de un dialog
export interface DialogButtonConfig {
  label: string;
  action: () => void;
  severity?: 'primary' | 'secondary' | 'danger' | 'success';
}

// Configuración para radiobuttons dentro de un dialog
export interface RadioButtonConfig {
  label: string;
  value: any;
}

// Configuración para los pasos en un stepepr
export interface StepContent {
  label?: string;
  text?: string;
  showForm?: boolean;
  formConfig?: CollectionFormConfig[];
  radioButtons?: RadioButtonConfig[];
  customSelector?: CustomSelectorConfig;
  showUpload?: boolean;
  imageType?: '2D' | '3D';
  isExcelUpload?: boolean;
}

// Configuración del cuadro de diálogo dinámico
export interface DialogConfig {
  header: string;
  buttons: DialogButtonConfig[];
  showStepper?: boolean;
  stepsContent?: StepContent[]; // Contenido dinámico por paso
}

// Configuración para un selector customizado
export interface CustomSelectorConfig<T = any> {
  items: T[];
  displayFields: string[];
  identifier: string;
  searchPlaceholder?: string;
  displayTemplate?: (item: T) => { title: string; subtitle?: string };
}
