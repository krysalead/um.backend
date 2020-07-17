import * as mongoose from 'mongoose';

import { provideSingleton, inject } from '../../ioc';
import { IConfigService, IDatabaseService } from '../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
import { factory } from './LoggingService';
import { DatabaseService } from './DatabaseService';
import { Config } from '../../interfaces/config';

const logger = factory.getLogger('services.MongoDBService');

let mockgoose;

@provideSingleton(CORE_TYPES.DatabaseService)
export class MongoDBService extends DatabaseService
  implements IDatabaseService {
  constructor(
    @inject(CORE_TYPES.ConfigService)
    configurationService: IConfigService
  ) {
    super(configurationService);
  }

  reset() {
    if (mockgoose) {
      logger.info('Database reset');
      return mockgoose.helper.reset();
    }
    // We can't do it
    return Promise.reject('Cannot reset non-mocked database');
  }
  init(configuration: Config): Promise<any> {
    if (configuration.mockDb) {
      logger.info('Database mocked');
      let Mockgoose = require('mockgoose').Mockgoose;
      mockgoose = new Mockgoose(mongoose);
      return mockgoose.prepareStorage().then(() => {
        return this._init(configuration).then(() => {
          logger.info('Init complete');
        });
      });
    } else {
      return this._init(configuration).then(() => {
        logger.info('Init complete');
      });
    }
  }

  _init(configuration: Config) {
    return new Promise((resolve, reject) => {
      mongoose.set('debug', configuration.database.mongo.debug);
      mongoose.connect(
        configuration.database.mongo.url,
        { useMongoClient: true },
        error => {
          let databaseName = configuration.database.mongo.url
            ? configuration.database.mongo.url.split('/')[3]
            : 'Missing database';
          if (error) {
            logger.error(
              `Failed to connect to database at ${databaseName}`,
              error
            );
            reject();
          } else {
            logger.info(
              `Successfully connected to database at ${databaseName}`
            );
            resolve();
          }
        }
      );
    });
  }

  close() {
    mongoose.connection.close(message => {
      logger.info('Database connection closed with: ' + message);
    });
  }
}
