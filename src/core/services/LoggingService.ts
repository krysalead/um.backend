import {
  LoggerFactoryOptions,
  LFService,
  LogGroupRule,
  LogLevel,
  CategoryServiceFactory,
  CategoryConfiguration,
  LoggerType,
  LogMessage
} from 'typescript-logging';
import {get} from './CLSService';

import * as moment from 'moment';

import { IConfigService } from '../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
import { iocContainer } from '../../ioc';
let config: IConfigService = iocContainer.get(CORE_TYPES.ConfigService);

console.log(config.getConfig().logging.services);

const messageFormatter = (message:LogMessage)=>{
  const reqId = get('reqId');
  const date = moment(message.date).format('YYYY-MM-DD HH:mm:ss,SSS');
  const logLEvel = LogLevel[message.level].toUpperCase();
  const loggerName = message.loggerName.split('.');
  let formatted =`${date} ${logLEvel} [${loggerName[0]}][${loggerName[1]}] ${message.messageAsString}`
  if(reqId){
    formatted+=` (\x1b[1;34m${reqId}\x1b[0m)`
  }
  return formatted;
}

let serviceRule = new LogGroupRule(
  new RegExp('service.+'),
  LogLevel[config.getConfig().logging.services]
)

serviceRule.formatterLogMessage=messageFormatter;

let controlerRule = new LogGroupRule(
  new RegExp('controller.+'),
  LogLevel[config.getConfig().logging.controllers]
)
controlerRule.formatterLogMessage=messageFormatter;

let generalRule = new LogGroupRule(
  new RegExp('.+'),
  LogLevel[config.getConfig().logging.general]
)

// Create options instance and specify 2 LogGroupRules:
// * One for any logger with a name starting with model, to log on debug
// * The second one for anything else to log on info
const options = new LoggerFactoryOptions()
  .addLogGroupRule(
    serviceRule
  )
  .addLogGroupRule(
    controlerRule
  )
  .addLogGroupRule(
    generalRule
  );
// Create a named loggerfactory and pass in the options and export the factory.
// Named is since version 0.2.+ (it's recommended for future usage)
export const factory = LFService.createNamedLoggerFactory(
  'LoggerFactory',
  options
);
