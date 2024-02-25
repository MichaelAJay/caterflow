import { IAccountService } from 'src/internal-modules/account/interfaces/account.service.interface';

export const mockAccountService: IAccountService = {
  createAccount: jest.fn(),
};
