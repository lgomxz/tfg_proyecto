export enum ToastType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warn',
  ERROR = 'error'
}

export interface ToastConfig {
  id?: number;
  severity: ToastType;
  summary: string;
  detail: string;
}
