export const CORE_TYPES = {
  DBService: "DBService",
  DatabaseService: "DatabaseService",
  ConfigService: "ConfigService",
  AuthService: "AuthService",
  SecurityService: "AppSecurityService",
  AppUserService: "AppUserService",
  AnalyticService: "AnalyticService",
  MailService: "MailService",
  HookManagerService: "HookManagerService",
  MetricService: "MetricService",
  SQLService: "SQLiteService"
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
  INVALID_EMAIL: -10
};

export const CORE_STORAGE = {
  AUTH_USER: "authUser",
  USER_ID: "userId"
};

export const METRICS = {
  STARTUP: "STARTUP",
  REQUEST: "REQUEST",
  CALC_LOADED: "CALC_LOADED",
  CALC_SAVED: "CALC_SAVED"
};
