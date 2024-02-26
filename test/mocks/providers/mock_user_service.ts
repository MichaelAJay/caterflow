import { IUserService } from 'src/internal-modules/user/interfaces/user.service.interface';

export const mockUserService: IUserService = {
  getUserByExternalUID: jest.fn(),
};
