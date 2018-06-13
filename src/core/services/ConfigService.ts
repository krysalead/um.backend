import { provideSingleton } from '../../ioc';

import { IConfigService } from '../../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
//Load from the user definition
import { Config } from '../../interfaces/config';

import { config as productonConfig } from '../../config/production';
import { config as developmentConfig } from '../../config/development';
import { config as testConfig } from '../../config/test';

@provideSingleton(CORE_TYPES.ConfigService)
export class ConfigService implements IConfigService {
  config: Config;
  constructor() {
    console.log('ConfigService: loading ');
    switch (process.env.ENV) {
      case 'test':
        console.log('----------> test');
        this.config = testConfig;
        break;
      case 'production':
        console.log('----------> production');
        this.config = productonConfig;
        break;
      default:
        console.log('----------> development');
        this.config = developmentConfig;
    }
  }
  getConfig(): Config {
    return this.config;
  }
}
