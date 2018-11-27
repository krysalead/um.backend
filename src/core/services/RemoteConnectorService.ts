let net = require('net');
import { iocContainer } from '../../ioc';
import { CORE_TYPES } from '../interfaces/coreTypes';
import { IDatabaseService } from '../interfaces/services';
import { IConfigService } from '../interfaces/services';
import { factory } from './LoggingService';

const logger = factory.getLogger('services.RemoteConnector');

class RemoteConnector {
  start() {
    let server = net.createServer(function(socket) {
      socket.on('data', function(data) {
        let payload = JSON.parse(data);
        let dataService: IDatabaseService = iocContainer.get(
          CORE_TYPES.DatabaseService
        );
        switch (payload.action) {
          case 'dbreset':
            logger.info('Reseting the database...');
            dataService.reset().then(
              () => {
                logger.info('Database reseted ' + payload.action);
                socket.write(JSON.stringify({ success: payload.action }));
              },
              reason => {
                logger.warn('dbreset failed for: ' + reason);
                socket.write(
                  JSON.stringify({ error: reason, action: payload.action })
                );
              }
            );
            break;
          case 'dbinject':
            logger.info('Injecting data in the database...');
            dataService.injectData(payload.parameters[0]).then(
              injectedData => {
                logger.info('Database data injected ' + payload.action);
                socket.write(
                  JSON.stringify({
                    success: payload.action,
                    data: injectedData
                  })
                );
              },
              reason => {
                logger.warn('dbInject failed for: ' + reason);
                socket.write(
                  JSON.stringify({
                    error: JSON.stringify(reason),
                    action: payload.action
                  })
                );
              }
            );
            break;
          case 'log':
            logger.info(payload.parameters[0]);
            Promise.resolve().then(() => {
              socket.write(JSON.stringify({ success: payload.action }));
            });
            break;
          default:
            logger.warn('Unkown command...');
            socket.write(
              JSON.stringify({ error: 'Unknown command:' + payload.action })
            );
            return;
        }
      });

      //socket.pipe(socket);
    });
    let config: IConfigService = iocContainer.get(CORE_TYPES.ConfigService);
    const netInterface = config.getConfig().remote.interface || '127.0.0.1';
    const netPort = config.getConfig().remote.port || 1337;
    logger.info(
      `Server remote control started on port ${netInterface}:${netPort}`
    );
    server.listen(netPort, netInterface);
  }
}

export const remoteConnector: RemoteConnector = new RemoteConnector();
