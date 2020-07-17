export interface UserAuth {
  id?: string;
  login: string;
  password: string;
  channel?: string;
  roles?: string[];
  validated?: boolean;
  locked?: Date;
  isMigrated?: boolean;
  updatedAt?: Date;
}

export interface UserRegistration extends UserAuth {
  firstName: string;
  lastName: string;
}
