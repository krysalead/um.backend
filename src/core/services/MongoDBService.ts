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
let mockgoose;

@provideSingleton(CORE_TYPES.DatabaseService)
export class MongoDBService extends DatabaseService
  implements IDatabaseService {
  constructor(
    @inject(CORE_TYPES.ConfigService) configurationService: IConfigService
  ) {
    super(configurationService);
    const configuration = configurationService.getConfig();
    if (configuration.mockDb) {
      let Mockgoose = require('mockgoose').Mockgoose;
      mockgoose = new Mockgoose(mongoose);
      mockgoose.prepareStorage().then(() => {
        this.init(configuration);
      });
    } else {
      this.init(configuration);
    }
  }

  reset() {
    if (mockgoose) {
      return mockgoose.helper.reset();
    }
    // We can't do it
    return Promise.reject("Can't reset non-mocked database");
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
