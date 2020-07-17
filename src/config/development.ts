import { Config } from "../interfaces/config";

export const config: Config = {
  mockDb: false,
  remote: {
    enabled: false,
  },
  database: {
    mongo: {
      url: process.env.DATABASE_URL || "mongodb://localhost:27017/dbTest",
      debug: true,
    },
  },
  server: {
    port: 4000,
    name: process.env.NAME || "main",
    cors: "http://localhost:8888",
    url: "http://localhost:8888",
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
