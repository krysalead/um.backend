import { provideSingleton } from '../../ioc';

import { IAuthService } from '../interfaces/services';
import { CORE_TYPES } from '../interfaces/coreTypes';
import { UserAuth } from '../interfaces/UserAuth';

@provideSingleton(CORE_TYPES.AuthService)
export class EmailPasswordAuthService implements IAuthService {
  register(userAuth: UserAuth): Promise<UserAuth> {
    throw new Error('Method not implemented.');
  }
  login(userAuth: UserAuth): Promise<UserAuth> {
    throw new Error('Method not implemented.');
  }
}
