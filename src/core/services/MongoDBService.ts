import * as mongoose from 'mongoose';
import * as path from 'path';

import { provideSingleton, inject } from '../../ioc';
import { syncEach, safeAccess } from '../Utils';
import { IConfigService, IDatabaseService } from '../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
const password = require('password-hash-and-salt');
import { factory } from './LoggingService';
import { DatabaseService } from './DatabaseService';

const logger = factory.getLogger('services.DatabaseService');

@provideSingleton(CORE_TYPES.DatabaseService)
export class MongoDBService extends DatabaseService
  implements IDatabaseService {
  constructor(
    @inject(CORE_TYPES.ConfigService) configurationService: IConfigService
  ) {
    super(configurationService);
    const configuration = configurationService.getConfig();
    (<any>mongoose).Promise = Promise;
    if (configuration.mockDb) {
      var Mockgoose = require('mockgoose').Mockgoose;
      var mockgoose = new Mockgoose(mongoose);
      var self = this;
      mockgoose.prepareStorage().then(() => {
        this.init(configuration);
      });
    } else {
      this.init(configuration);
    }
  }

  init(configuration) {
    mongoose.connect(
      configuration.database.url,
      { useMongoClient: true },
      error => {
        let databaseName = configuration.database.url
          ? configuration.database.url.split('/')[3]
          : 'Missing database';
        if (error) {
          logger.error(
            `Failed to connect to database at ${databaseName}`,
            error
          );
        } else {
          logger.info(`Successfully connected to database at ${databaseName}`);
          this.injectData(configuration);
        }
      }
    );
  }

  close() {
    mongoose.connection.close(message => {
      logger.info('Database connection closed with: ' + message);
    });
  }
}
