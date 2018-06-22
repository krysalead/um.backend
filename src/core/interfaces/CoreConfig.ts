export interface CoreConfig {
  mockDb: boolean;
  auth: {
    JWTSecret: string;
  };
  data: {
    file: string;
  };
}
