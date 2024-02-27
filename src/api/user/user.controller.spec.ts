import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserAccountStatus', () => {
    it('should return user account status true when user has account id', async () => {
      const req = {
        user: { id: 'testId', accountId: 'acctId' },
      } as AuthenticatedRequest;
      const result = await controller.getUserAccountStatus(req);
      expect(result).toEqual({ hasAccount: true });
    });
    it('should return user account status false when user does not have account id', async () => {
      const req = {
        user: { id: 'testId' },
      } as AuthenticatedRequest;
      const result = await controller.getUserAccountStatus(req);
      expect(result).toEqual({ hasAccount: false });
    });
    it('should return user account status false when req does not have user', async () => {
      const req = {} as AuthenticatedRequest;
      const result = await controller.getUserAccountStatus(req);
      expect(result).toEqual({ hasAccount: false });
    });
  });
});
