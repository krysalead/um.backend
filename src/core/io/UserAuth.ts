import { IServiceStatus } from '../interfaces/services';
import { UserAuth } from '../interfaces/UserAuth';

export interface AuthResponse extends IServiceStatus {
  token?: string;
}

export interface AuthRequest extends UserAuth {}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}
