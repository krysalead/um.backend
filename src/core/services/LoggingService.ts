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
import Chalk from 'chalk';

import { IConfigService } from '../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
import { iocContainer } from '../../ioc';
let config: IConfigService = iocContainer.get(CORE_TYPES.ConfigService);

console.log("----------> Log level: ",config.getConfig().logging.services);

const messageFormatter = (message:LogMessage)=>{
  const reqId = get('reqId');
  const date = moment(message.date).format('YYYY-MM-DD HH:mm:ss,SSS');
  const logLevel = LogLevel[message.level].toUpperCase();
  let  color = 'red';
  switch(logLevel){
case 'INFO':
color='blue';
break;
case 'DEBUG':
color='green';
break;
case 'WARN':
color='yellow'
  }
  const loggerName = message.loggerName.split('.');
  let formatted = Chalk`${date} {${color} ${logLevel}} [${loggerName[0]}][${loggerName[1]}] ${message.messageAsString}`
  if(reqId){
    formatted+="("+Chalk.gray(reqId)+")"
  }
  if(message.error){
    formatted += '\n'+Chalk.red(message.error.message);
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
generalRule.formatterLogMessage=messageFormatter;
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
