import './core/iocRegistration';
/* Core injection configuration */
import './core/services/MongoDBService';
/* service */
import './services/FederationService';
import './services/ClubService';
import './services/InvitationService';
import './services/MailService';
import './services/UserService';
import './services/AppUserService';
import './services/CalcService';
import './services/SecurityService';
/* Controller */
import './controllers/FederationController';
import './controllers/ClubController';
import './controllers/InvitationController';
import './controllers/UserController';
import './controllers/CalculationController';

import { iocContainer } from './ioc';
import { TYPES } from './interfaces/types';

// Register the interceptors that are in the services (TODO Maybe better to extract them later)
iocContainer.get(TYPES.ClubService);
iocContainer.get(TYPES.FederationService);
