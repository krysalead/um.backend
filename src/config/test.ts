import { Config } from '../interfaces/config';

export const config: Config = {
  mockDb: true,
  remote: {
    enabled: true,
    port: 1337,
    interface: '127.0.0.1'
  },
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/dbTest'
  },
  server: {
    port: 4000,
    name: 'main'
  },
  logging: {
    services: process.env.LOGGING_SERVICES || 'Debug',
    controllers: process.env.LOGGING_CONTROLLERS || 'Debug',
    general: process.env.LOGGING_GENERAL || 'Debug'
  },
  analytics: {
    id: process.env.ANLYTICS_ID
  },
  auth: {
    JWTSecret: 'test secret key'
  },
  data: {
    file: null
  }
};
