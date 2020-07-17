import { Route, Example, Post, Body, Path, Get, Security, Request } from "tsoa";
import { provide, inject } from "../../ioc";
import {
  IAuthService,
  IAppUserService,
  ISwimSecurityService,
  IServiceStatus,
} from "../interfaces/services";
import { factory } from "../services/LoggingService";
import { SwimController } from "./SwimController";
import { get } from "../services/CLSService";
import { CORE_TYPES } from "../interfaces/coreTypes";
import {
  AuthResponse,
  AuthRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
} from "../io/UserAuth";
import { SwimSecurityService } from "../services/SwimSecurityService";

const logger = factory.getLogger("controller.Auth");

@Route("auth")
@provide(AuthController)
export class AuthController extends SwimController {
  constructor(
    @inject(CORE_TYPES.AuthService) private authService: IAuthService,
    @inject(CORE_TYPES.SecurityService)
    private securityService: ISwimSecurityService,
    @inject(CORE_TYPES.AppUserService) private appUserService: IAppUserService
  ) {
    super(logger);
  }

  @Post("login")
  @Example<AuthResponse>({
    status: 0,
    message: "",
    token: "String",
  })
  public async login(@Body() request: AuthRequest): Promise<AuthResponse> {
    logger.info("Start login");
    let status = {
      status: 0,
      message: "",
    };
    let token: string;
    let payload: any;
    let service = "";
    try {
      // Clean the login from trailling spaces
      request.login = request.login.trim().toLowerCase();
      service = "authService";
      let loginServiceOutput = await this.authService.login(request);
      logger.info("Login success for ");
      // Get the functional user
      try {
        service = "appUserService";
        payload = await this.appUserService.getTokenPayload(
          loginServiceOutput.userAuth
        );
      } catch (e) {
        logger.error("Failed to get the payload defaulting to empty", e);
        payload = {};
      }
      service = "securityService";
      // User is validated we can generate the token
      token = this.securityService.generateToken(
        payload,
        loginServiceOutput.userAuth
      );
      // Do not send this to the client
      delete loginServiceOutput.userAuth;
      status = loginServiceOutput;
      logger.info("Storing token in http header");
      this.setHeader("Set-Cookie", "sessionToken=" + token);
    } catch (e) {
      status = this.generateServiceFailureStatus(e, service);
    }
    logger.info("End login");
    return {
      ...status,
      token: token,
    };
  }

  @Get("refresh")
  @Security("jwt", [])
  @Example<AuthResponse>({
    status: 0,
    message: "",
    token: "String",
  })
  public async refresh(): Promise<AuthResponse> {
    logger.info("Start login");
    let status = {
      status: 0,
      message: "",
    };
    let token: string;
    let payload: any;
    try {
      // Get the functional user
      try {
        payload = await this.appUserService.getTokenPayload(get("authUser"));
      } catch (e) {
        logger.error("Failed to get the payload defaulting to empty", e);
        payload = {};
      }
      // User is validated we can generate the token
      token = this.securityService.generateToken(payload, get("authUser"));
    } catch (e) {
      status = this.generateServiceFailureStatus(e, "securityService");
    }
    logger.info("End login");
    return {
      ...status,
      token: token,
    };
  }

  @Post("register")
  @Example<AuthResponse>({
    status: 0,
    message: "",
  })
  public async register(@Body() request: AuthRequest): Promise<AuthResponse> {
    logger.info("Start register");
    let status = {
      status: 0,
      message: "",
    };
    try {
      // Clean the login from trailling spaces
      request.login = request.login.trim().toLowerCase();
      status = await this.authService.register(request);
    } catch (e) {
      status = this.generateServiceFailureStatus(e);
    }
    logger.info("End register");
    return status;
  }

  @Post("changePassword")
  @Security("jwt", [])
  @Example<IServiceStatus>({
    status: 0,
    message: "",
  })
  public async changePassword(
    @Body() input: ChangePasswordRequest
  ): Promise<IServiceStatus> {
    logger.info("Start changePassword");
    let status = {
      status: 0,
      message: "",
    };
    try {
      status = await this.authService.changePassword(
        get("authUser"),
        input.oldPassword,
        input.newPassword,
        false
      );
    } catch (e) {
      status = this.generateServiceFailureStatus(e);
    }
    logger.info("End changePassword");
    return status;
  }

  @Post("resetPassword")
  @Example<IServiceStatus>({
    status: 0,
    message: "",
  })
  public async resetPassword(
    @Body() input: ResetPasswordRequest
  ): Promise<IServiceStatus> {
    logger.info("Start resetPassword");
    let status = {
      status: 0,
      message: "",
    };
    try {
      status = await this.authService.resetPassword(input.email);
    } catch (e) {
      status = this.generateServiceFailureStatus(e);
    }
    logger.info("End resetPassword");
    return status;
  }
}
