import { Config } from "./config";
import { IServiceStatus } from "../core/interfaces/services";

export interface IConfigService {
  getConfig(): Config;
}
