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
    cors: process.env.CORS || "http://localhost:3000",
    url: process.env.SERVER_URL || "http://localhost:3000",
  },
  metric: {
    token:
      "PEJ4QB0ZsAIV7x5sGnAd4AI3HvYeUFeF-OIGlppFflH4OhQln7YphtPWxIRMZ2JqmZCqcrM28pEgqRjRRwciFA==",
    url: "https://eu-central-1-1.aws.cloud2.influxdata.com",
    bucket: "functional_test",
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
