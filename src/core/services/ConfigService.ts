import { provideSingleton } from '../../ioc';

import { IConfigService } from '../../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
//Load from the user definition
import { Config } from '../../interfaces/config';

import { config } from '../../config/production';

@provideSingleton(CORE_TYPES.ConfigService)
export class ConfigService implements IConfigService {
  getConfig(): Config {
    return config;
  }
}
