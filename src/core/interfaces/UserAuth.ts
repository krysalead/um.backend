export interface UserAuth {
  id?: string;
  login: string;
  password: string;
  channel?: string;
  role?: string[];
  validated?: boolean;
  locked?: Date;
}
