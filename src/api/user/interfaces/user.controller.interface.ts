import {
  AuthenticatedRequest,
  AuthenticatedRequestForNewUser,
} from 'src/api/interfaces/authenticated-request.interface';

export interface IUserController {
  createUser(
    req: AuthenticatedRequestForNewUser,
  ): Promise<{ message: string; code: string }>;
  getUserAccountStatus(
    req: AuthenticatedRequest,
  ): Promise<{ hasAccount: boolean }>;
  verifyEmail(
    req: AuthenticatedRequest,
  ): Promise<{ message: string; code: string }>;
}
