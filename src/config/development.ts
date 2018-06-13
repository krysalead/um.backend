import { Config } from '../interfaces/config';

export const config: Config = {
  mockDb: false,
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/dbTest'
  },
  server: {
    port: 4000,
    name: process.env.NAME || 'main'
  },
  logging: {
    services: process.env.LOGGING_SERVICES || 'Debug',
    controllers: process.env.LOGGING_CONTROLLERS || 'Debug',
    general: process.env.LOGGING_GENERAL || 'Debug'
  }
};
