import { Config } from '../../interfaces/config';

export interface IDatabaseService {}

export interface IConfigService {
  getConfig(): Config;
}

export interface IServiceStatus {
  status: number;
  message: string;
}
