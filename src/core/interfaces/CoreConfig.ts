export interface CoreConfig {
  mockDb: boolean;
  remote: {
    enabled: boolean;
    port?: number;
    interface?: string;
  };
  database: {
    mongo?: {
      url: string;
      debug: boolean;
      adapter: string;
    };
    sql?: {
      path: string;
      entities: [any];
      logging: boolean;
      adapter: string;
    };
  };
  server: {
    port: number;
    name: string;
    cors: string;
    url: string;
  };
  analytics?: {
    id: string;
  };
  metric: {
    kafka?: {
      brokers: string;
      topic: string;
      clientId: string;
    };
    influx?: {
      token: string;
      url: string;
      bucket: string;
      organization: string;
    };
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
