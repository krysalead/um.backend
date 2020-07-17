export interface CoreConfig {
  mockDb: boolean;
  remote: {
    enabled: boolean;
    port?: number;
    interface?: string;
  };
  database: {
    mongo: {
      url: string;
      debug: boolean;
    };
    sql?: {
      path: string;
      entities: [any];
      logging: boolean;
    };
  };
  server: {
    port: number;
    name: string;
    cors: string;
    url: string;
  };
  analytics: {
    id: string;
  };
  metric: {
    token: string;
    url: string;
    bucket: string;
  };
  logging: {
    services: string;
    controllers: string;
    general: string;
  };
  auth: {
    JWTSecret: string;
  };
  data: {
    file: string;
  };
}