import { IUserDbHandler } from 'src/internal-modules/external-handlers/db-handlers/user-db-handler/interfaces/user-db-handler.service.interface';

export const mockUserDbHandlerService: IUserDbHandler = {
  createUser: jest.fn(),
  retrieveUserByExternalAuthUID: jest.fn(),
  updateUser: jest.fn(),
};
