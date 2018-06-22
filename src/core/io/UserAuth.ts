import { IServiceStatus } from '../interfaces/services';
import { UserAuth } from '../interfaces/UserAuth';

export interface AuthResponse extends IServiceStatus {
  token?: string;
}

export interface AuthRequest extends UserAuth {}
