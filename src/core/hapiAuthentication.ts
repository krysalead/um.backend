import * as hapi from 'hapi';
import * as Boom from 'boom';
import { CORE_TYPES } from './interfaces/coreTypes';
import { iocContainer } from '../ioc';

import { factory } from './services/LoggingService';
import { ISwimSecurityService } from './interfaces/services';
const logger = factory.getLogger('service.hapiAuthentication');

export function hapiAuthentication(
  request: hapi.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  const token =
    (request.payload && request.payload['token']) ||
    (request.query && request.query['token']) ||
    request.headers['x-access-token'];
  const securityService: ISwimSecurityService = iocContainer.get(
    CORE_TYPES.SecurityService
  );
  if (securityName === 'jwt') {
    return new Promise((resolve, reject) => {
      if (!token) {
        throw Boom.unauthorized('No token provided');
      } else {
        return securityService.verify(token, scopes).then(
          (user: any) => {
            logger.info('Authentication successful:' + user.id);
            resolve(user);
          },
          reason => {
            logger.warn('Fail to autorised: ' + reason);
            reject(Boom.unauthorized(reason));
          }
        );
      }
    });
  } else {
    // Other security interceptor
    // No need to check that token exists as it has been done before.
    return securityService.verify(token, []).then(
      (user: any) => {
        return securityService
          .executeInterceptors(securityName, request, user)
          .then(() => {
            return user;
          });
      },
      reason => {
        // should never happen
        logger.warn('Error in verification: ' + reason);
        return Boom.unauthorized(reason);
      }
    );
  }
}
