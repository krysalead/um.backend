import * as Boom from "boom";
import { provideSingleton, inject } from "../../ioc";
import * as EmailValidator from "email-validator";
import {
  IAuthService,
  IServiceStatus,
  IAppUserService,
  ILoginServiceOutput,
} from "../interfaces/services";
import { CORE_TYPES, CORE_ERROR_CODES } from "../interfaces/coreTypes";
import { UserAuth, UserRegistration } from "../interfaces/UserAuth";
const password = require("password-hash-and-salt");
import { DAODocumentUserAuth, DAOUserAuth } from "../dao/UserAuthDAO";
import { factory } from "../services/LoggingService";
import { IConfigService } from "../../interfaces/services";
const generatePassword = require("password-generator");
const bcrypt = require("bcrypt-nodejs");

const logger = factory.getLogger("service.EmailPasswordAuth");

@provideSingleton(CORE_TYPES.AuthService)
export class EmailPasswordAuthService implements IAuthService {
  constructor(
    @inject(CORE_TYPES.ConfigService) private configService: IConfigService,
    @inject(CORE_TYPES.AppUserService) private appUserService: IAppUserService
  ) {}

  async register(userRegistration: UserRegistration): Promise<IServiceStatus> {
    logger.info("Start register");
    if (!EmailValidator.validate(userRegistration.login)) {
      const message = "Invalid email: " + userRegistration.login;
      logger.error(message);
      return {
        status: CORE_ERROR_CODES.INVALID_EMAIL,
        message: message,
      };
    }
    let userAuthDAO: DAODocumentUserAuth = await DAOUserAuth.findOne({
      login: userRegistration.login,
    });
    let status = {
      status: CORE_ERROR_CODES.REQUEST_OK,
      message: "",
    };
    if (!userAuthDAO) {
      userRegistration.password = await this.hash(userRegistration.password);
      if (userRegistration.password) {
        this.appUserService.beforeRegister(userRegistration);
        userAuthDAO = new DAOUserAuth(userRegistration);
        await userAuthDAO.save();
        await this.appUserService.afterRegister(
          this.documentToUserRegistrationObject(userAuthDAO, userRegistration)
        );
        logger.info("User created");
      } else {
        logger.error("Failed to hash password");
        status = {
          status: CORE_ERROR_CODES.FAILED_TO_HASH,
          message: "Failed to hash password",
        };
      }
    } else {
      logger.warn("User already exists");
      status = {
        status: CORE_ERROR_CODES.USER_ALREADY_EXISTS,
        message: "User already exists",
      };
    }

    logger.info("End register");
    return status;
  }
  /**
   *
   * @param userAuth
   */
  async login(userAuth: UserAuth): Promise<ILoginServiceOutput> {
    logger.info("Start login");
    let userAuthDAO: DAODocumentUserAuth = await DAOUserAuth.findOne({
      login: userAuth.login,
    });
    await this.appUserService.beforeLogin(userAuth);
    let status;
    let valid = false;
    if (userAuthDAO) {
      valid = await this.validate(
        userAuth.password,
        userAuthDAO.password,
        userAuthDAO.isMigrated
      );
      if (valid) {
        logger.info("Login success");
        if (userAuthDAO.isMigrated) {
          await this.changePassword(
            userAuthDAO,
            userAuth.password,
            userAuth.password,
            userAuthDAO.isMigrated
          );
        }
        userAuthDAO.lastLogin = new Date();
        //Migration done we remove the flag
        userAuthDAO.isMigrated = false;
        userAuthDAO = await userAuthDAO.save();
        await this.appUserService.onLoginSuccess(userAuth);
        status = {
          status: CORE_ERROR_CODES.REQUEST_OK,
          message: "",
          userAuth: userAuthDAO.documentToObject(),
        };
      } else {
        logger.error("Login failure: Invalid password");
      }
    } else {
      logger.error("Login failure: User doesnot exist");
    }
    if (!valid) {
      throw Boom.unauthorized("Invalid user or password");
    }
    logger.info("End login");
    return status;
  }

  async changePassword(
    user: UserAuth,
    oldPassword: string,
    newPassword: string,
    isMigrated: boolean
  ): Promise<IServiceStatus> {
    logger.info("Start changePassword");
    let status = {
      status: CORE_ERROR_CODES.REQUEST_OK,
      message: "",
    };
    // UserAuth
    let valid = false;
    logger.debug("Validate user current password");

    valid = await this.validate(oldPassword, user.password, isMigrated);
    if (valid) {
      logger.debug("Updating user " + user.id);
      let newPasswordHash = await this.hash(newPassword);
      await DAOUserAuth.findByIdAndUpdate(user.id, {
        password: newPasswordHash,
      });
      logger.info("Password updated");
    } else {
      logger.error(`Password don't match ${user.id}`);
      status = {
        status: CORE_ERROR_CODES.WRONG_CREDENTIAL,
        message: "Wrong credential",
      };
    }
    logger.info("End changePassword");
    return status;
  }

  async resetPassword(login: string): Promise<IServiceStatus> {
    logger.info("Start resetPassword");
    let status = {
      status: CORE_ERROR_CODES.REQUEST_OK,
      message: "",
    };
    let userAuthDAO: DAODocumentUserAuth = await DAOUserAuth.findOne({
      login: login,
    });
    if (userAuthDAO) {
      let generatedPassword = generatePassword(12, true, /\d/, "kz-");
      let generatePasswordHash = await this.hash(generatedPassword);
      await DAOUserAuth.findOneAndUpdate(
        {
          login: login,
        },
        {
          password: generatePasswordHash,
        }
      );
      await this.appUserService.onResetPassword(
        generatedPassword,
        userAuthDAO.documentToObject()
      );
      logger.info("Password updated");
    } else {
      logger.error("User doesnot exist");
      status = {
        status: CORE_ERROR_CODES.USER_NOT_EXISTS,
        message: "User doesnot exist",
      };
    }
    logger.info("End resetPassword");
    return status;
  }

  private documentToUserRegistrationObject(
    document: DAODocumentUserAuth,
    userRegistration: UserRegistration
  ): UserRegistration {
    return {
      ...document.documentToObject(),
      firstName: userRegistration.firstName,
      lastName: userRegistration.lastName,
    };
  }

  public hash(userPassword): Promise<string> {
    return new Promise((resolve, reject) => {
      password(userPassword).hash(function (error, hash) {
        if (error) {
          reject(null);
          logger.error(error);
        } else {
          resolve(hash);
        }
      });
    });
  }

  private validate(
    userPassword: string,
    hash: string,
    isMigrated: boolean
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (isMigrated) {
        resolve(bcrypt.compareSync(userPassword, hash));
      } else {
        password(userPassword).verifyAgainst(hash, function (error, verified) {
          if (error) {
            logger.error(error);
            resolve(false);
          }
          if (!verified) {
            logger.error("Password Validation failed");
          }
          resolve(verified);
        });
      }
    });
  }
}
