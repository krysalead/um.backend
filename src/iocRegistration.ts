/* service */
// Core services
import "./core/services/ConfigService";
import "./core/services/SQLiteService";
import "./core/services/AnalyticService";
import "./core/services/InfluxMetricService";
// Functional services
import "./services/GeoIpService";
import "./services/UserService";
/* Controller */
import "./controllers/UserController";

import { iocContainer } from "./ioc";
import { TYPES } from "./interfaces/types";
