import { User } from "../models/User";
import { Location } from "./location";

export interface IUserService {
  addUser(user: User): Promise<User>;
  listUser(search?: string): Promise<User[]>;
}

export interface IGeoIpService {
  getCountry(ip): Promise<Location>;
}
