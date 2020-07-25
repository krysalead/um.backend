import { Config } from "../interfaces/config";
import { UserEntity } from "../dao/UserEntity";

export const config: Config = {
  mockDb: false,
  remote: {
    enabled: false,
  },
  database: {
    sql: {
      path: process.env.SQLLITE_PATH || "./data/user.db3",
      entities: [UserEntity],
      logging: true,
      adapter: "SQLiteService",
    },
  },
  server: {
    port: +process.env.PORT || 4000,
    name: process.env.NAME || "main",
    cors: process.env.CORS || "*",
    url: process.env.DOMAIN_URL || "http://localhost:8888",
  },
  metric: {
    token: process.env.METRIC_TOKEN,
    url:
      process.env.METRIC_URL ||
      "https://eu-central-1-1.aws.cloud2.influxdata.com",
    bucket: process.env.METRIC_BUCKET || "functional",
  },
  analytics: {
    id: null,
  },
  logging: {
    services: process.env.LOGGING_SERVICES || "Info",
    controllers: process.env.LOGGING_CONTROLLERS || "Info",
    general: process.env.LOGGING_GENERAL || "Info",
  },
  auth: {
    JWTSecret: process.env.JWT_SECRET,
  },
  data: {
    file: null,
  },
};
