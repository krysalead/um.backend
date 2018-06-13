import { IServiceStatus } from '../interfaces/services';
import { factory } from '../services/LoggingService';
import { SwimController } from './SwimController';

const logger = factory.getLogger('controller.Auth');

export class AuthController extends SwimController {
  constructor() {
    super(logger);
  }
}
