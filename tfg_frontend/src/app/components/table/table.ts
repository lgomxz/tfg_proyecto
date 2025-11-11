export interface ColumnsConfig {
  title: string;
  apiField: string;
  isDate?: true;
  width?: number;
  clickEvent?: () => void;
  isCheckbox?: boolean;
  sortable?: boolean;
}
