import { Route, Example, Post, Body, Path } from 'tsoa';
import { provide, inject } from '../../ioc';
import {
  IAuthService,
  IAppUserService
} from '../interfaces/services';
import { factory } from '../services/LoggingService';
import { SwimController } from './SwimController';
import { CORE_TYPES } from '../interfaces/coreTypes';
import { AuthResponse, AuthRequest } from '../io/UserAuth';
import { SecurityService } from '../services/SecurityService';

const logger = factory.getLogger('controller.Auth');

@Route('auth')
@provide(AuthController)
export class AuthController extends SwimController {
  constructor(
    @inject(CORE_TYPES.AuthService) private authService: IAuthService,
    @inject(CORE_TYPES.SecurityService)
    private securityService: SecurityService,
    @inject(CORE_TYPES.AppUserService) private appUserService: IAppUserService
  ) {
    super(logger);
  }

  @Post('login')
  @Example<AuthResponse>({
    status: 0,
    message: '',
    token: 'String'
  })
  public async login(@Body() request: AuthRequest): Promise<AuthResponse> {
    logger.info('Start login');
    let status = {
      status: 0,
      message: ''
    };
    let token: string;
    try {
      let loginServiceOutput = await this.authService.login(request);
      if (loginServiceOutput.status === 0) {
        logger.info('Login success for ' + loginServiceOutput);
        //User is validated we can generate the token
        token = this.securityService.generateToken(
          await this.appUserService.getTokenPayload(
            loginServiceOutput.userAuth
          ),
          loginServiceOutput.userAuth.role
        );
      }
      //Do not send this to the client
      delete loginServiceOutput.userAuth;
      status = loginServiceOutput;
    } catch (e) {
      status = this.generateServiceFailureStatus(e);
    }
    logger.info('End login');
    return { ...status, token: token };
  }

  @Post('register')
  @Example<AuthResponse>({
    status: 0,
    message: ''
  })
  public async register(@Body() request: AuthRequest): Promise<AuthResponse> {
    logger.info('Start register');
    let status = {
      status: 0,
      message: ''
    };
    try {
      status = await this.authService.register(request);
    } catch (e) {
      status = this.generateServiceFailureStatus(e);
    }
    logger.info('End register');
    return status;
  }
}
