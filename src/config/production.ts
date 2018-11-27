import { Config } from '../interfaces/config';

export const config: Config = {
  mockDb: false,
  remote: {
    enabled: false
  },
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/dbProd'
  },
  server: {
    port: +process.env.PORT || 4000,
    name: process.env.NAME || 'main'
  },
  logging: {
    services: process.env.LOGGING_SERVICES || 'Info',
    controllers: process.env.LOGGING_CONTROLLERS || 'Info',
    general: process.env.LOGGING_GENERAL || 'Info'
  },
  auth: {
    JWTSecret: process.env.JWT_SECRET
  },
  data: {
    file: null
  }
};
