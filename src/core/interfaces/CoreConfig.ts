export interface CoreConfig {
  mockDb: boolean;
  remote: {
    enabled: boolean;
    port?: number;
    interface?: string;
  };
  auth: {
    JWTSecret: string;
  };
  data: {
    file: string;
  };
}
