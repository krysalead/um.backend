import './iocRegistration';
const hapi = require('hapi');
import { RegisterRoutes } from './routes';
import { factory } from './core/services/LoggingService';
import { IConfigService } from './core/interfaces/services';
import { CORE_TYPES } from './core/interfaces/coreTypes';
import { iocContainer } from './ioc';
import { v1 as uuidv1 } from 'uuid';
import { set, middleware } from './core/services/CLSService';
import { remoteConnector } from './core/services/RemoteConnectorService';
const logger = factory.getLogger('main.Server');
const server = new hapi.Server({});
const cors = require('hapi-cors-headers')('localhost:8888', logger);

/**
 * Configuration for request logger
 */
const goodOptions = {
  reporters: {
    EventReporter: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ response: '*', request: '*' }]
      },
      {
        module: 'good-console'
      },
      'stdout'
    ]
  }
};

/**
 * Start all the services
 */
const startService = async () => {
  iocContainer.get(CORE_TYPES.DatabaseService);
};

const init = async () => {
  let config: IConfigService = iocContainer.get(CORE_TYPES.ConfigService);
  process.on('uncaughtException', function(err) {
    logger.error('Caught exception: ' + err);
  });
  // We start the remote server if needed
  if (config.getConfig().remote.enabled) {
    remoteConnector.start();
  }
  server.connection({
    port: config.getConfig().server.port,
    labels: config.getConfig().server.name
  });
  server.ext('onPreResponse', cors);
  // Install logger
  await server.register({
    register: require('good'),
    options: goodOptions
  });
  // Install core and functionnal routes
  RegisterRoutes(server);
  // Start permanent services like database
  await startService();
  // Hook on each request to add a unique id for each transaction
  server.ext({
    type: 'onRequest',
    method: function(request, reply) {
      const { req, res } = request.raw;
      request.id = uuidv1();
      const methodColors = {
        get: 32,
        delete: 31,
        put: 36,
        post: 33
      };
      let color = methodColors[request.method.toLowerCase()];
      request.log(
        [],
        `\x1b[1;${color}m${request.method}\x1b[0m ${request.path}`
      );

      return middleware(req, res, function() {
        set('reqId', request.id);
        reply.continue();
      });
    }
  });
  await server.start();
  logger.info(`Server running at ${server.info.uri}`);
};

module.exports = {
  init: init
};
