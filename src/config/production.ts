import { Config } from '../interfaces/config';

export const config: Config = {
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/dbTest'
  },
  server: {
    port: process.env.PORT || 4000,
    name: process.env.NAME || 'main'
  }
};
