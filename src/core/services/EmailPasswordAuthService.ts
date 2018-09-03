import { provideSingleton, inject } from '../../ioc';

import {
  IAuthService,
  IServiceStatus,
  IAppUserService,
  ILoginServiceOutput
} from '../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
import { UserAuth } from '../interfaces/UserAuth';
const password = require('password-hash-and-salt');
import { DAODocumentUserAuth, DAOUserAuth } from '../dao/UserAuthDAO';
import { factory } from '../services/LoggingService';
import { IConfigService } from '../../interfaces/services';

const logger = factory.getLogger('service.EmailPasswordAuth');

@provideSingleton(CORE_TYPES.AuthService)
export class EmailPasswordAuthService implements IAuthService {
  constructor(
    @inject(CORE_TYPES.ConfigService) private configService: IConfigService,
    @inject(CORE_TYPES.AppUserService) private appUserService: IAppUserService
  ) {}

  async register(userAuth: UserAuth): Promise<IServiceStatus> {
    logger.info('Start register');
    let userAuthDAO: DAODocumentUserAuth = await DAOUserAuth.findOne({
      login: userAuth.login
    });
    let status = {
      status: 0,
      message: ''
    };
    if (!userAuthDAO) {
      userAuth.password = await this.hash(userAuth.password);
      if (userAuth.password) {
        this.appUserService.beforeRegister(userAuth);
        let userAuthDAO = new DAOUserAuth(userAuth);
        await userAuthDAO.save();
        this.appUserService.afterRegister(this.documentToObject(userAuthDAO));
        logger.info('User created');
      } else {
        logger.error('Failed to hash password');
        status = {
          status: -2,
          message: 'Failed to hash password'
        };
      }
    } else {
      logger.warn('User already exists');
      status = {
        status: -1,
        message: 'User already exists'
      };
    }

    logger.info('End register');
    return status;
  }
  /**
   *
   * @param userAuth
   */
  async login(userAuth: UserAuth): Promise<ILoginServiceOutput> {
    logger.info('Start login');
    let userAuthDAO: DAODocumentUserAuth = await DAOUserAuth.findOne({
      login: userAuth.login
    });
    await this.appUserService.beforeLogin(userAuth);
    let status;
    let valid =
      userAuthDAO &&
      (await this.validate(userAuth.password, userAuthDAO.password));
    if (valid) {
      logger.info('Login success');
      await this.appUserService.afterLogin(userAuth);
      status = {
        status: 0,
        message: '',
        userAuth: this.documentToObject(userAuthDAO)
      };
    } else {
      logger.info('Login failure: Invalid user or password');
      status = {
        status: -1,
        message: 'Invalid user or password'
      };
    }
    logger.info('End login');
    return status;
  }

  private documentToObject(document: DAODocumentUserAuth): UserAuth {
    return {
      id: document._id,
      login: document.login,
      password: document.password,
      channel: document.channel,
      role: document.role,
      validated: document.validated,
      locked:document.locked
    };
  }

  public hash(userPassword): Promise<string> {
    return new Promise((resolve, reject) => {
      password(userPassword).hash(function(error, hash) {
        if (error) {
          reject(null);
          logger.error(error);
        } else {
          resolve(hash);
        }
      });
    });
  }

  private validate(userPassword: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      password(userPassword).verifyAgainst(hash, function(error, verified) {
        if (error) {
          logger.error(error);
          reject(false);
        }
        if (!verified) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
