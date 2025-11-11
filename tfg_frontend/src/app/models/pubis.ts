import { DigitalModel } from "./digital-model";
import { Collection } from "./collection"
import { Subject } from "./subject";

export interface Pubis {
  id?: string;
  shortId?: string;
  laterality: string; // Laterality (puede ser 'left' o 'right')
  preservation_state: string;
  subject?: Subject | null;
  collections?: Collection;
  digitalModels?: DigitalModel[];
}