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
    let configEnv = process.env.ENV;
    switch (configEnv) {
      case 'test':
        this.config = testConfig;
        break;
      case 'production':
        this.config = productonConfig;
        break;
      default:
        configEnv='development';
        this.config = developmentConfig;
    }
    console.log('----------> Config loaded: ',configEnv);
  }
  getConfig(): Config {
    return this.config;
  }
}
