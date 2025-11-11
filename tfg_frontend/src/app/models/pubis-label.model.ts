import { Label } from './label';
import { Pubis } from './pubis';
import { User } from './user';

export interface PubisLabel {
  id: string;
  pubis: Pubis;
  label: Label;
  user: User;
  isTraining: boolean;
  score?: number;
  createdAt: Date;
}
