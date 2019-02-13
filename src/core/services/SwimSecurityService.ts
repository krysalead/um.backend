const JWT = require('jsonwebtoken');
import { provideSingleton, inject } from '../../ioc';
import { CORE_TYPES } from '../interfaces/coreTypes';
import { IConfigService } from '../../interfaces/services';
import { UserAuth } from '../interfaces/UserAuth';
import { set } from '../services/CLSService';
import { factory } from '../services/LoggingService';
import { DAOUserAuth } from '../dao/UserAuthDAO';
import {
  ISwimSecurityService,
  IInterceptorHandler,
  IServiceStatus
} from '../interfaces/services';
const logger = factory.getLogger('service.SwimSecurity');

@provideSingleton(CORE_TYPES.SecurityService)
export class SwimSecurityService implements ISwimSecurityService {
  private interceptors: {};
  constructor(
    @inject(CORE_TYPES.ConfigService) private configService: IConfigService
  ) {
    logger.info(CORE_TYPES.SecurityService + ' available');
  }

  public registerInterceptor(identifier: string, handler: IInterceptorHandler) {
    if (!this.interceptors) {
      this.interceptors = {};
    }
    logger.info(`Interceptor [${identifier}] registered`);
    this.interceptors[identifier] = handler;
  }

  public executeInterceptors(
    identifier: string,
    request: any,
    user: any
  ): Promise<IServiceStatus> {
    if (!this.interceptors) {
      this.interceptors = {};
    }
    if (!this.interceptors[identifier]) {
      let message = `Interceptor [${identifier}] not registered`;
      logger.warn(message);
      return Promise.resolve({ status: 0, message: message });
    }

    return this.interceptors[identifier].handle(request, user);
  }

  public generateToken(payload: any, userAuth: UserAuth): string {
    return JWT.sign(
      { scopes: userAuth.roles, payload: payload, __userAuthId__: userAuth.id },
      this.configService.getConfig().auth.JWTSecret
    );
  }

  public verify(token: string, scopes: string[]): Promise<any> {
    logger.info('Start verify');
    return new Promise((resolve, reject) => {
      JWT.verify(token, this.configService.getConfig().auth.JWTSecret, function(
        err: any,
        decoded: any
      ) {
        if (err) {
          logger.error('Error during token verification', err);
          reject(err);
        } else {
          logger.debug('User lookup ' + decoded.__userAuthId__);
          DAOUserAuth.findById(decoded.__userAuthId__).then(
            userDao => {
              if (!userDao) {
                reject('Invalid user, nothing found');
              }
              let user = userDao.documentToObject();
              set('authUser', user);
              // Check if JWT contains all required scopes
              for (let scope of scopes) {
                if (user.roles && !user.roles.includes(scope)) {
                  logger.warn(
                    `JWT does not contain required scope [${scopes}] available [${
                      user.roles
                    }]`
                  );
                  reject('You are not allowed to access this resource');
                }
              }
              resolve(decoded.payload);
            },
            reason => {
              logger.error('Error during user retrieve', reason);
              reject(reason);
            }
          );
        }
      });
    });
  }
  public async addRole(userid: string, role: string): Promise<any> {
    logger.info('Start addRole');
    await DAOUserAuth.findByIdAndUpdate(userid, {
      $push: {
        roles: role
      }
    });
    logger.info('End addRole');
    return;
  }
}
