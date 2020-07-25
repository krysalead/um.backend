import * as hapi from "hapi";
import * as Boom from "boom";
import { CORE_TYPES } from "./constants";
import { iocContainer } from "../ioc";
import { set } from "./services/CLSService";
import { factory } from "./services/LoggingService";
import { ISwimSecurityService, IAnalyticService } from "./interfaces/services";
const logger = factory.getLogger("service.hapiAuthentication");

export function hapiAuthentication(
  request: hapi.Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  const token =
    (request.payload && request.payload["token"]) ||
    (request.query && request.query["token"]) ||
    request.headers["x-access-token"] ||
    request.state.sessionToken;
  const securityService: ISwimSecurityService = iocContainer.get(
    CORE_TYPES.SecurityService
  );
  const analyticService: IAnalyticService = iocContainer.get(
    CORE_TYPES.AnalyticService
  );
  if (securityName === "jwt") {
    return new Promise((resolve, reject) => {
      if (!token) {
        analyticService.sendEvent("Authentication", "No token provided");
        throw Boom.unauthorized("No token provided");
      } else {
        return securityService.verify(token, scopes).then(
          (user: any) => {
            set("userId", user.id);
            analyticService.sendEvent("Authentication", "Success");
            logger.info("Authentication successful:" + user.id);
            resolve(user);
          },
          (reason) => {
            analyticService.sendEvent("Authentication", "Failure");
            logger.warn("Fail to autorised: " + reason);
            reject(Boom.unauthorized(reason));
          }
        );
      }
    });
  } else {
    logger.info("Processing Security Interceptors:" + scopes);
    // Other security interceptor
    // No need to check that token exists as it has been done before.
    return securityService.verify(token, []).then(
      (user: any) => {
        return Promise.all(
          scopes.map(async (scope) => {
            return await securityService.executeInterceptors(
              scope,
              request,
              user
            );
          })
        )
          .then((results) => {
            if (
              results.reduce((acc, current) => acc * current.status, 1) !== 0
            ) {
              analyticService.sendEvent(
                "Authentication",
                "Missing organization"
              );
              throw Boom.preconditionRequired(
                "You must be in the context of an organization"
              );
            }
          })
          .then(() => {
            return user;
          })
          .catch((e) => {
            console.error(
              "Exception during security checks:",
              e.output ? e.output.payload.message : e
            );
            if (e.isBoom) {
              throw e;
            } else {
              throw Boom.serverUnavailable(
                "Something bad happen on the server please contact your administrator"
              );
            }
          });
      },
      (reason) => {
        // should never happen
        logger.warn("Error in verification: " + reason);
        return Boom.unauthorized(reason);
      }
    );
  }
}
