import { Config } from "../../interfaces/config";
import { UserAuth, UserRegistration } from "./UserAuth";
import { MetricStats } from "../interfaces/Metric";

export interface IDatabaseService {
  init(config: Config): Promise<string>;
  reset(): Promise<string>;
  close();
  injectData(file: String): Promise<string>;
}

export interface IConfigService {
  getConfig(): Config;
  getUIEntrypoint(subdomain?: string): string;
}

export interface IServiceStatus {
  status: number;
  message: string;
}

export interface IMailContext {
  template: string;
  to: string;
  subject: string;
  language: string;
  context: any;
}

export interface ILoginServiceOutput extends IServiceStatus {
  userAuth?: UserAuth;
}

export interface IAuthService {
  login(userAuth: UserAuth): Promise<ILoginServiceOutput>;
  register(userAuth: UserAuth): Promise<IServiceStatus>;
  changePassword(
    user: UserAuth,
    oldPassword: string,
    newPassword: string,
    isMigrated: boolean
  ): Promise<IServiceStatus>;
  resetPassword(login: string): Promise<IServiceStatus>;
}

export interface IAppUserService {
  beforeLogin(userAuth: UserAuth): Promise<any>;
  onLoginSuccess(userAuth: UserAuth): Promise<any>;
  beforeRegister(userRegistration: UserRegistration): Promise<any>;
  afterRegister(userRegistration: UserRegistration): Promise<any>;
  getTokenPayload(userAuth: UserAuth): Promise<any>;
  onResetPassword(newPassword: string, userAuth: UserAuth): Promise<any>;
  getUserAuth(userId: string): Promise<UserAuth>;
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
export interface IMailService {
  localizationPath: string;
  getPartials(templateSource: string): Promise<any>;
  sendMail(
    email: string,
    template: string,
    context: any
  ): Promise<IServiceStatus>;
  mock();
  getLastMail(mailTxId: string): string;
  processMailTemplate(template: string, context: any): Promise<string>;
}

export interface IProcessHook {
  onProcessStart(data: any, eventName: string): Promise<any>;
}

export interface IHookManagerService {
  register(customer: string, eventName: string, hook: IProcessHook);
  newEvent(customer: string, eventName: string, data: any): Promise<any>;
}

export interface ISQLService {
  init();
  getByPk(entity: any, pkName: any, pkValue: any): Promise<any>;
  insertSingleEntity(entityType: any, entity: any): Promise<any>;
  getEntities(
    entityType: any,
    fieldsValues?: { field: string; value: string }[]
  ): Promise<any>;
  // To be use under review and mainly in test not production code
  executreRawSQL(query: string, entityType: any): Promise<any>;
}

export interface IMetricService {
  push(type: string, name: string, value: any, tag?: string, tagValue?: string);
  close();
  query(
    type: string,
    name: string,
    value: any,
    rangeStart: number,
    rangeStop: number,
    tag?: string,
    tagValue?: string
  ): Promise<MetricStats[]>;
}

export class FunctionalException {
  constructor(
    private code: number,
    private message: string,
    private type: ExceptionType
  ) {}
}

export enum ExceptionType {
  warn = "warn",
  error = "error",
  fatal = "fatal",
}
