import * as mongoose from 'mongoose';

import { provideSingleton, inject } from '../../ioc';

import { IConfigService, IDatabaseService } from '../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';

import { factory } from './LoggingService';

const logger = factory.getLogger('services.DatabaseService');

@provideSingleton(CORE_TYPES.DatabaseService)
export class DatabaseService implements IDatabaseService {
  constructor(
    @inject(CORE_TYPES.ConfigService) configurationService: IConfigService
  ) {
    const configuration = configurationService.getConfig();
    (<any>mongoose).Promise = Promise;
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
