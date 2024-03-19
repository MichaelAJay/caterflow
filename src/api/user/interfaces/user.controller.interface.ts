import { AuthenticatedRequest } from 'src/api/interfaces/authenticated-request.interface';
import { LoginRequest } from 'src/api/interfaces/login-request.interface';

export interface IUserController {
  // createUser(
  //   req: AuthenticatedRequestForNewUser,
  // ): Promise<{ message: string; code: string }>;
  // getUserCompanyStatus(
  //   req: AuthenticatedRequest,
  // ): Promise<{ hasCompany: boolean }>;
  verifyEmail(
    req: AuthenticatedRequest,
  ): Promise<{ message: string; code: string }>;
  /**
   * Ensures user exists in system or creaets if not
   */
  login(req: LoginRequest): Promise<{ hasCompany: boolean }>;
}
