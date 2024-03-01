import { IGuardService } from 'src/common/guards/guard/interfaces/guard.service.interface';

export const mockGuardService: IGuardService = {
  verifyToken: jest.fn(),
};
