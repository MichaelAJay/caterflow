import {
  AuthenticatedRequest,
  AuthenticatedRequestForNewUser,
} from 'src/api/interfaces/authenticated-request.interface';

export interface IUserController {
  createUser(req: AuthenticatedRequestForNewUser): Promise<any>;

  getUserAccountStatus(
    req: AuthenticatedRequest,
  ): Promise<{ hasAccount: boolean }>;
}
