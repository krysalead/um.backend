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
  },
  auth: {
    JWTSecret:
      'ITXGcsXGxNUfywnmzCC0gp+1nq7kH9l6Al1SUVFKAxRYo/E5/agNCTjVNay57ZnWH35k1GSRao6yGnUF12YbPtqdeNSy7PY2e5FGQGNgV9jJFCVgyQUWbDwPJ6+feXwH2YpPGdMMt6mWfYBy6Of2hUl2PFVTFp4PZhfvJRXxYEgS68qYBPOEzaaKH5VnaNi3swxnudUrK5ARuIltizYABmnLurvdK5d74GYf5JGQ5ZjIX+5ipu6oI8BsMfDsROLzP9Hf/CvDmstyDxD4D7UoOpYrnkaOFAAG6IF78C6xWmGYEyoPjqkKS7TgqWLNZW+HjKE87xw+VvHxt80WwEO5dw=='
  },
  data: {
    file: './e2e/data/test.json'
  }
};
