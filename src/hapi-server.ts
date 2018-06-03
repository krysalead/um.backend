import './iocRegistration';
const Hapi = require('hapi');
import { RegisterRoutes } from './routes';
import { factory } from './core/services/LoggingService';
import { IConfigService } from './core/interfaces/services';
import { CORE_TYPES } from './core/interfaces/coreTypes';
import { iocContainer } from './ioc';
const logger = factory.getLogger('Server');

const server = new Hapi.Server({});

/**
 * Configuration for request logger
 */
const goodOptions = {
  reporters: {
    myConsoleReporter: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ response: '*' }]
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
const StartService = async () => {
  iocContainer.get(CORE_TYPES.DatabaseService);
};

const init = async () => {
  let config: IConfigService = iocContainer.get(CORE_TYPES.ConfigService);
  server.connection({
    port: config.getConfig().server.port,
    labels: config.getConfig().server.name
  });
  RegisterRoutes(server);
  await StartService();
  await server.register({
    register: require('good'),
    options: goodOptions
  });
  await server.start();
  logger.info(`Server running at ${server.info.uri}`);
};

module.exports = {
  init: init
};
