import { IAccountDbHandler } from 'src/internal-modules/external-handlers/db-handlers/account-db-handler/interfaces/account-db-handler.service.interface';

export const mockAccountDbHandlerService: IAccountDbHandler = {
  createAccount: jest.fn(),
};
