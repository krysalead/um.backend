import { IServiceStatus } from "../core/interfaces/services";
import { User } from "../models/User";

export interface AddUserResponse extends IServiceStatus {
  data: User;
}

export interface AddUserRequest extends User {}

export interface ListUserResponse extends IServiceStatus {
  data: User[];
}
