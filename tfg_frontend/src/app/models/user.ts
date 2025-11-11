import { Role } from "./role";

export interface User {
  id?: string;
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  description?: string;
  role?: Role;
  photoUrl?: string;
}