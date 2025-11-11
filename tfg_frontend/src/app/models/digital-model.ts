import { MyFile } from './file';
import { Pubis } from './pubis';

export interface DigitalModel {
  id?: string | null;
  model_type: string;
  acquisition_date?: Date;
  pubis?: Pubis;
  files?: MyFile[];
}
