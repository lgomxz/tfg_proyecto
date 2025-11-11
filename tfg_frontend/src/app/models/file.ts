import { DigitalModel } from "./digital-model";

export interface MyFile {
  id?: string;
  name?: string;
  link?: string;
  digitalModel?: DigitalModel | null;
}

export interface FilesByModelType {
  '2D': File[];
  '3D': File[];
}