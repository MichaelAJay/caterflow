import { AuthenticatedRequest } from 'src/api/interfaces/authenticated-request.interface';

export interface IAccountController {
  createAccount(body: any, req: AuthenticatedRequest): Promise<any>;
}
