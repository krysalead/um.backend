import {
  LoggerFactoryOptions,
  LFService,
  LogGroupRule,
  LogLevel
} from 'typescript-logging';

import { IConfigService } from '../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
import { iocContainer } from '../../ioc';
let config: IConfigService = iocContainer.get(CORE_TYPES.ConfigService);
// Create options instance and specify 2 LogGroupRules:
// * One for any logger with a name starting with model, to log on debug
// * The second one for anything else to log on info
const options = new LoggerFactoryOptions()
  .addLogGroupRule(
    new LogGroupRule(
      new RegExp('service.+'),
      LogLevel[config.getConfig().logging.services]
    )
  )
  .addLogGroupRule(
    new LogGroupRule(
      new RegExp('controller.+'),
      LogLevel[config.getConfig().logging.controllers]
    )
  )
  .addLogGroupRule(
    new LogGroupRule(
      new RegExp('.+'),
      LogLevel[config.getConfig().logging.general]
    )
  );

// Create a named loggerfactory and pass in the options and export the factory.
// Named is since version 0.2.+ (it's recommended for future usage)
export const factory = LFService.createNamedLoggerFactory(
  'LoggerFactory',
  options
);
