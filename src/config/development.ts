import { Config } from "../interfaces/config";
import { UserEntity } from "../dao/UserEntity";

export const config: Config = {
  geoloc: {
    apikey: "5e048d200353beabfb3038ae3c7eadfd",
  },
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
    cors: process.env.CORS || "http://localhost:3000",
    url: process.env.SERVER_URL || "http://localhost:3000",
  },
  metric: {
    kafka: {
      brokers: process.env.BROKERS || "kafka:9092",
      topic: process.env.TOPIC || "metric-topic",
      clientId: "um-app",
    },
  },
  analytics: {
    id: null,
  },
  logging: {
    services: process.env.LOGGING_SERVICES || "Debug",
    controllers: process.env.LOGGING_CONTROLLERS || "Debug",
    general: process.env.LOGGING_GENERAL || "Debug",
  },
  auth: {
    JWTSecret: "development secret key",
  },
  data: {
    file: null,
  },
};
