import { Config } from "../interfaces/config";
import { UserEntity } from "../dao/UserEntity";

export const config: Config = {
  mockDb: false,
  remote: {
    enabled: false,
  },
  database: {
    sql: {
      path: process.env.SQLLITE_PATH || "./data/test.db3",
      entities: [UserEntity],
      logging: false,
      adapter: "SQLiteService",
    },
  },
  server: {
    port: +process.env.PORT || 4000,
    name: "main",
    cors: process.env.CORS || "http://localhost:3000",
    url: process.env.SERVER_URL || "http://localhost:3000",
  },
  metric: {
    token: process.env.METRIC_TOKEN,
    url: "https://eu-central-1-1.aws.cloud2.influxdata.com",
    bucket: process.env.METRIC_BUCKET || "functional_test",
  },
  analytics: {
    id: null,
  },
  logging: {
    services: process.env.LOGGING_SERVICES || "Error",
    controllers: process.env.LOGGING_CONTROLLERS || "Info",
    general: process.env.LOGGING_GENERAL || "Info",
  },
  auth: {
    JWTSecret: "test secret key",
  },
  data: {
    file: null,
  },
};
