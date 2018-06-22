import * as mongoose from 'mongoose';
import * as path from 'path';

import { provideSingleton, inject } from '../../ioc';
import { syncEach, safeAccess } from '../Utils';
import { IConfigService, IDatabaseService } from '../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
const password = require('password-hash-and-salt');
import { factory } from './LoggingService';

const logger = factory.getLogger('services.DatabaseService');

@provideSingleton(CORE_TYPES.DatabaseService)
export class DatabaseService implements IDatabaseService {
  constructor(
    @inject(CORE_TYPES.ConfigService) configurationService: IConfigService
  ) {
    const configuration = configurationService.getConfig();
    (<any>mongoose).Promise = Promise;
    if (configuration.mockDb) {
      var Mockgoose = require('mockgoose').Mockgoose;
      var mockgoose = new Mockgoose(mongoose);
      var self = this;
      mockgoose.prepareStorage().then(function() {
        self.init(configuration);
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

  async injectData(configuration) {
    const dataFile = configuration.data.file;
    if (dataFile) {
      logger.info('Loading data from:' + dataFile);
      // we have a file set up
      const data = require('../../../' + dataFile);
      let context = {
        currentKey: '',
        documentCounter: 0
      };
      let typeCounter = 0;
      let documentCounter = 0;
      await syncEach(Object.keys(data), async key => {
        const coreDAOPath = '../dao/';
        const userDAOPath = '../../dao/';
        let dao;
        try {
          dao = require(coreDAOPath + key);
        } catch (e) {
          try {
            //Maybe not a core DAO
            dao = require(userDAOPath + key);
          } catch (e) {}
        }
        if (dao) {
          typeCounter++;
          //Get the first element of the prototype of the objec which sould be the DAO
          dao = dao[Object.keys(dao)[0]];
          await syncEach(data[key], async (obj, index) => {
            context.currentKey = key;
            let modifiedObj = await this.processDecorator(obj, context);
            await this.injectDocument(dao, obj, context);
          });
        } else {
          logger.warn("Can't load:" + key + ' from core or user DAO');
        }
      });
      logger.info(
        context.documentCounter +
          ' document(s) inserted in ' +
          typeCounter +
          ' type(s)'
      );
    }
  }

  private async injectDocument(dao, obj, context) {
    var daoHolder = { dao: dao };
    try {
      let daoObject = new daoHolder['dao'](obj);
      let record = await daoObject.save();
      if (!context[context.currentKey]) {
        context[context.currentKey] = [];
      }
      context[context.currentKey].push(record);
      context.documentCounter++;
    } catch (e) {
      logger.error(
        "Can't create object for:" +
          context.currentKey +
          ' definition #' +
          context.currentIndex +
          ' not proper'
      );
    }
  }

  private async processDecorator(obj, context) {
    await Promise.all(
      Object.keys(obj).map(async key => {
        if (obj[key].toUpperCase && obj[key].indexOf('|password') > -1) {
          let newPassword = await this.hashPassword(obj[key].split('|')[0]);
          obj[key] = newPassword;
        }
        if (/^\$\{.*\}$/.test(obj[key])) {
          obj[key] = this.getContextValue(obj[key], context);
        }
      })
    );
    return obj;
  }

  private getContextValue(variable, context) {
    let found = variable.match(/^\$\{(.*)\}$/);
    return safeAccess(context, found[1], 'Not found');
  }

  private async hashPassword(userPassword) {
    return new Promise((resolve, reject) => {
      password(userPassword).hash(function(error, hash) {
        if (error) {
          reject(null);
          logger.error(error);
        } else {
          resolve(hash);
        }
      });
    });
  }

  close() {
    mongoose.connection.close(message => {
      logger.info('Database connection closed with: ' + message);
    });
  }
}
