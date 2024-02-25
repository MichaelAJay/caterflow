import { AuthenticatedRequest } from 'src/api/interfaces/authenticated-request.interface';

export interface IUserController {
  getUserAccountStatus(
    req: AuthenticatedRequest,
  ): Promise<{ hasAccount: boolean }>;
}
