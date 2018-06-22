import * as hapi from 'hapi';
import * as jwt from 'jsonwebtoken';
import * as Boom from 'boom';
import { CORE_TYPES } from './interfaces/coreTypes';
import { iocContainer } from '../ioc';
import { SecurityService } from './services/SecurityService';

import { factory } from './services/LoggingService';
const logger = factory.getLogger('service.hapiAuthentication');

export function hapiAuthentication(
  request: hapi.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === 'jwt') {
    const token =
      request.payload.token ||
      request.query.token ||
      request.headers['x-access-token'];

    return new Promise((resolve, reject) => {
      if (!token) {
        throw Boom.unauthorized('No token provided');
      } else {
        const securityService: SecurityService = iocContainer.get(
          CORE_TYPES.SecurityService
        );
        return securityService.verify(token, scopes).then(
          (user: any) => {
            logger.info(user);
            resolve(user);
          },
          reason => {
            logger.warn('Fail to autorised: ' + reason);
            reject(Boom.unauthorized(reason));
          }
        );
      }
    });
  }
}
