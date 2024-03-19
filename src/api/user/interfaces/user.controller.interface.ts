import {
  AuthenticatedRequest,
  AuthenticatedRequestForNewUser,
} from 'src/api/interfaces/authenticated-request.interface';
import { LoginRequest } from 'src/api/interfaces/login-request.interface';

export interface IUserController {
  // createUser(
  //   req: AuthenticatedRequestForNewUser,
  // ): Promise<{ message: string; code: string }>;
  // getUserAccountStatus(
  //   req: AuthenticatedRequest,
  // ): Promise<{ hasAccount: boolean }>;
  verifyEmail(
    req: AuthenticatedRequest,
  ): Promise<{ message: string; code: string }>;
  /**
   * Ensures user exists in system or creaets if not
   */
  login(req: LoginRequest): Promise<{ hasAccount: boolean }>;
}
