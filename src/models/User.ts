import { StringValidator } from "tsoa";

export interface User {
  id?: number;
  lastName: string;
  firstName: string;
  email: string;
}
