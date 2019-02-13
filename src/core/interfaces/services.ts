import { Config } from '../../interfaces/config';
import { UserAuth, UserRegistration } from './UserAuth';

export interface IDatabaseService {
  init(config: Config);
  reset(): Promise<string>;
  injectData(file: String): Promise<string>;
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
  onLoginSuccess(userAuth: UserAuth): Promise<any>;
  beforeRegister(userRegistration: UserRegistration): Promise<any>;
  afterRegister(userRegistration: UserRegistration): Promise<any>;
  getTokenPayload(userAuth: UserAuth): Promise<any>;
}

export interface IInterceptorHandler {
  handle(req: any, user: any): Promise<IServiceStatus>;
}

export interface ISwimSecurityService {
  addRole(userId: string, role: string): Promise<any>;
  generateToken(payload: any, userAuth: UserAuth): string;
  verify(token: string, scopes: string[]): Promise<any>;
  registerInterceptor(identifier: string, handler: IInterceptorHandler);
  executeInterceptors(
    identifier: string,
    request: any,
    user: any
  ): Promise<IServiceStatus>;
}

export interface IAnalyticService {
  sendEvent(eventCategory: string, eventAction: string);
}
