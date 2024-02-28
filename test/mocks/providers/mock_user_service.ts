import { IUserService } from 'src/internal-modules/user/interfaces/user.service.interface';

export const mockUserService: IUserService = {
  createUser: jest.fn(),
  getUserByExternalUID: jest.fn(),
};
