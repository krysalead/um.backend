export const CORE_TYPES = {
  DBService: "DBService",
  MongoDBService: "MongoDBService",
  ConfigService: "ConfigService",
  AuthService: "AuthService",
  SecurityService: "AppSecurityService",
  AppUserService: "AppUserService",
  AnalyticService: "AnalyticService",
  MailService: "MailService",
  HookManagerService: "HookManagerService",
  MetricService: "MetricService",
  SQLService: "SQLiteService",
};

export const CORE_ERROR_CODES = {
  REQUEST_OK: 0,
  SERVICE_FAILURE: -2,
  WRONG_PARAMETER: -1,
  MISSING_RIGHTS: -3,
  WRONG_CREDENTIAL: -4,
  MISSING_ORGA: -5,
  USER_NOT_EXISTS: -6,
  USER_ALREADY_EXISTS: -7,
  FAILED_TO_HASH: -8,
  FAIL_TO_SEND_MAIL: -9,
  INVALID_EMAIL: -10,
};

export const CORE_STORAGE = {
  AUTH_USER: "authUser",
  USER_ID: "userId",
};

export const METRICS = {
  STARTUP: "STARTUP",
  REQUEST: "REQUEST",
};

export const REGEXP = {
  EMAIL: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
};
