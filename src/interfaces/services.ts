import { User } from "../models/User";

export interface IUserService {
  addUser(user: User): Promise<User>;
  listUser(search?: string): Promise<User[]>;
}
