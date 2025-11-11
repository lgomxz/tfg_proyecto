// Enum para el tipo de campos del formulario
export enum FormInputWidth {
  XS = 'extrashort',
  S = 'short',
  M = 'medium',
  L = 'large',
  XL = 'extraLarge',
  FULL = 'full',
}

// Enum para los tipos de entrada del formulario
export enum FormInputType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  EMAIL = 'email',
  DATE = 'date',
  TEXTAREA = 'textarea',
  PASSWORD = 'password',
}

// Interfaz para los valores de selección en los campos select
export interface SelectValues {
  code: string | number;
  originalDescription?: string;
  description: string;
}

// Interfaz para la configuración de un campo de formulario
export interface FormConfig {
  id: string;
  originalLabel?: string;
  mandatory: boolean;
  label: string;
  value?: any;
  type?: FormInputType;
  apiField: string;
  width?: FormInputWidth;
  values?: SelectValues[];
  showAtlasButton?: boolean;
  readOnly?: boolean;
  showPasswordStrengthMeter?: boolean;
}

// Interface para la configuración de un grupo de campos en el formulario
export interface CollectionFormConfig {
  groupName?: string;
  originalGroupName?: string;
  child: FormConfig[];
}
