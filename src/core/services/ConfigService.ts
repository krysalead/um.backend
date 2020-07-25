import { provideSingleton } from "../../ioc";

import { CORE_TYPES } from "../constants";
//Load from the user definition
import { Config } from "../../interfaces/config";

import { config as productonConfig } from "../../config/production";
import { config as developmentConfig } from "../../config/development";
import { config as testConfig } from "../../config/test";
import { config as nreConfig } from "../../config/nre";
import { IConfigService } from "../interfaces/services";

@provideSingleton(CORE_TYPES.ConfigService)
export class ConfigService implements IConfigService {
  config: Config;
  constructor() {
    let configEnv = process.env.ENV || "development";
    configEnv = configEnv.toLowerCase();
    switch (configEnv) {
      case "qualification":
        this.config = testConfig;
        break;
      case "production":
        this.config = productonConfig;
        break;
      case "nre":
        this.config = nreConfig;
        break;
      default:
        configEnv = "development";
        this.config = developmentConfig;
    }
    console.log("----------> Config loaded: ", configEnv);
  }
  getConfig(): Config {
    return this.config;
  }
  getUIEntrypoint(subdomain?: string): string {
    let url = this.getConfig().server.url;
    if (subdomain) {
      return url.replace("calculator", subdomain).replace("beta", subdomain);
    } else {
      return url;
    }
  }
}
