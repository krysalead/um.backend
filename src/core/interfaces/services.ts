import { Config } from '../../interfaces/config';
import { UserAuth } from './UserAuth';

export interface IDatabaseService {}

export interface IConfigService {
  getConfig(): Config;
}

export interface IServiceStatus {
  status: number;
  message: string;
}

export interface IAuthService {
  login(userAuth: UserAuth): Promise<UserAuth>;
  register(userAuth: UserAuth): Promise<UserAuth>;
}
