import * as mongoose from 'mongoose';

import { provideSingleton } from '../../ioc';
import { syncEach, safeAccess } from '../Utils';
import { IConfigService, IDatabaseService } from '../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
const password = require('password-hash-and-salt');
import { factory } from './LoggingService';
import { Config } from '../../interfaces/config';

const logger = factory.getLogger('services.DatabaseService');

@provideSingleton(CORE_TYPES.DBService)
export abstract class DatabaseService implements IDatabaseService {
  constructor(configurationService: IConfigService) {
    (<any>mongoose).Promise = Promise;
  }
  abstract init(configuration: Config): Promise<any>;
  abstract reset(): Promise<string>;
  abstract close();
  async injectData(dataFile: string): Promise<any> {
    if (dataFile) {
      let data = dataFile;
      if (dataFile.toUpperCase) {
        logger.info('Loading data from:' + dataFile);
        // we have a file set up
        // Forced to deeply clone the data as require seems to have a cache
        data = JSON.parse(JSON.stringify(require('../../../' + dataFile)));
      }
      let context = {
        currentKey: '',
        documentCounter: 0
      };
      let typeCounter = 0;
      await syncEach(Object.keys(data), async key => {
        const coreDAOPath = '../dao/';
        const functionalDAOPath = '../../dao/';
        let dao;
        try {
          dao = require(coreDAOPath + key);
        } catch (e) {
          try {
            // Maybe not a core DAO
            dao = require(functionalDAOPath + key);
          } catch (e) {
            logger.error('Exception requiring ' + functionalDAOPath + key, e);
          }
        }
        if (dao) {
          typeCounter++;
          // Get the first element of the prototype of the objec which sould be the DAO
          dao = dao[Object.keys(dao)[0]];
          await syncEach(data[key], async (obj: any, index) => {
            context.currentKey = key;
            let modifiedObj = await this.processDecorator(obj, context);
            let recordedObj = await this.injectDocument(
              dao,
              modifiedObj,
              context
            );
            // tslint:disable-next-line:no-unused-expression
            obj.id = recordedObj._id;
          });
        } else {
          logger.warn(`Can't load:${key} from core or user DAO`);
        }
      });
      logger.info(
        context.documentCounter +
          ' document(s) inserted in ' +
          typeCounter +
          ' type(s)'
      );
      return data;
    }
  }

  private async injectDocument(dao, obj, context) {
    let daoHolder = { dao: dao };
    try {
      let daoObject = new daoHolder['dao'](obj);
      let record = await daoObject.save();
      if (!context[context.currentKey]) {
        context[context.currentKey] = [];
      }
      context[context.currentKey].push(record);
      context.documentCounter++;
      return record;
    } catch (e) {
      logger.error(
        `Can't create object for: ${context.currentKey} definition # ${
          context.currentIndex
        } not proper`
      );
      return {};
    }
  }

  private async processDecorator(obj, context) {
    let processedObj = Object.assign({}, obj);
    await Promise.all(
      Object.keys(processedObj).map(async key => {
        if (processedObj[key].map) {
          // Iterate over the element of the array
          processedObj[key] = await Promise.all(
            processedObj[key].map(async (item, index, arr) => {
              let element = await this.processSingleElement(item, context);
              obj[key][index] = element.oldValue;
              return element.newValue;
            })
          );
        } else {
          let element = await this.processSingleElement(
            processedObj[key],
            context
          );
          processedObj[key] = element.newValue;
          obj[key] = element.oldValue;
        }
      })
    );
    return processedObj;
  }

  private async processSingleElement(element, context) {
    let newValue, oldValue;
    oldValue = newValue = element;
    if (element.toUpperCase && element.indexOf('|password') > -1) {
      oldValue = element.split('|')[0];
      newValue = await this.hashPassword(oldValue);
    }
    if (element.toUpperCase && /^\$\{.*\}$/.test(element)) {
      newValue = this.getContextValue(element, context);
      // We don't care about the oldvalue in this case
      oldValue = newValue;
    }
    return { oldValue, newValue };
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
}
