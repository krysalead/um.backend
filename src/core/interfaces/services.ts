import { Config } from '../../interfaces/config';
import { UserAuth } from './UserAuth';

export interface IDatabaseService {
  init(config: Config);
}

export interface IConfigService {
  getConfig(): Config;
}

export interface IServiceStatus {
  status: number;
  message: string;
}

export interface ILoginServiceOutput extends IServiceStatus {
  userAuth?: UserAuth;
}

export interface IAuthService {
  login(userAuth: UserAuth): Promise<ILoginServiceOutput>;
  register(userAuth: UserAuth): Promise<IServiceStatus>;
}

export interface IAppUserService {
  beforeLogin(userAuth: UserAuth): Promise<any>;
  afterLogin(userAuth: UserAuth): Promise<any>;
  beforeRegister(userAuth: UserAuth): Promise<any>;
  afterRegister(userAuth: UserAuth): Promise<any>;
  getTokenPayload(userAuth: UserAuth): Promise<any>;
}
