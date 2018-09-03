const JWT = require('jsonwebtoken');
import { provideSingleton, inject } from '../../ioc';
import { CORE_TYPES } from '../interfaces/coreTypes';
import { IConfigService } from '../../interfaces/services';
import { UserAuth } from '../interfaces/UserAuth';

import { factory } from '../services/LoggingService';
const logger = factory.getLogger('service.Security');

@provideSingleton(CORE_TYPES.SecurityService)
export class SecurityService {
  constructor(
    @inject(CORE_TYPES.ConfigService) private configService: IConfigService
  ) {}
  public generateToken(payload: any, scopes: string[]): string {
    return JWT.sign(
      { scopes: scopes, payload: payload },
      this.configService.getConfig().auth.JWTSecret
    );
  }

  public verify(token: string, scopes: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      JWT.verify(token, this.configService.getConfig().auth.JWTSecret, function(
        err: any,
        decoded: any
      ) {
        if (err) {
          logger.error('Error during token verification', err);
          reject(err);
        } else {
          // Check if JWT contains all required scopes
          for (let scope of scopes) {
            if (!decoded.scopes.includes(scope)) {
              logger.warn('JWT does not contain required scope.');
              reject('You are not allowed to access this resource');
            }
          }
          resolve(decoded.payload);
        }
      });
    });
  }
}
