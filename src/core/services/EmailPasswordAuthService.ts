import { provideSingleton, inject } from '../../ioc';

import {
  IAuthService,
  IServiceStatus,
  IAppUserService,
  ILoginServiceOutput
} from '../interfaces/services';
import { CORE_TYPES, CORE_ERROR_CODES } from '../interfaces/coreTypes';
import { UserAuth, UserRegistration } from '../interfaces/UserAuth';
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

  async register(userRegistration: UserRegistration): Promise<IServiceStatus> {
    logger.info('Start register');
    let userAuthDAO: DAODocumentUserAuth = await DAOUserAuth.findOne({
      login: userRegistration.login
    });
    let status = {
      status: 0,
      message: ''
    };
    if (!userAuthDAO) {
      userRegistration.password = await this.hash(userRegistration.password);
      if (userRegistration.password) {
        this.appUserService.beforeRegister(userRegistration);
        userAuthDAO = new DAOUserAuth(userRegistration);
        await userAuthDAO.save();
        this.appUserService.afterRegister(
          this.documentToUserRegistrationObject(userAuthDAO, userRegistration)
        );
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
    let valid = false;
    if (userAuthDAO) {
      valid = await this.validate(userAuth.password, userAuthDAO.password);
      if (valid) {
        logger.info('Login success');
        await this.appUserService.onLoginSuccess(userAuth);
        status = {
          status: 0,
          message: '',
          userAuth: this.documentToUserAuthObject(userAuthDAO)
        };
      }
    } else {
      logger.error('User doesnot exist');
    }
    if (!valid) {
      logger.error('Login failure: Invalid user or password');
      status = {
        status: CORE_ERROR_CODES.WRONG_CREDENTIAL,
        message: 'Invalid user or password'
      };
    }
    logger.info('End login');
    return status;
  }

  private documentToUserAuthObject(document: DAODocumentUserAuth): UserAuth {
    return {
      id: document._id,
      login: document.login,
      password: document.password,
      channel: document.channel,
      roles: document.roles,
      validated: document.validated,
      locked: document.locked
    };
  }
  private documentToUserRegistrationObject(
    document: DAODocumentUserAuth,
    userRegistration: UserRegistration
  ): UserRegistration {
    return {
      ...this.documentToUserAuthObject(document),
      firstName: userRegistration.firstName,
      lastName: userRegistration.lastName
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
          resolve(false);
        }
        if (!verified) {
          logger.error('Password Validation failed');
        }
        resolve(verified);
      });
    });
  }
}
