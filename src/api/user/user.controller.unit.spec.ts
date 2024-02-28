import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import {
  AuthenticatedRequest,
  AuthenticatedRequestForNewUser,
} from '../interfaces/authenticated-request.interface';
import { UserService } from '../../internal-modules/user/user.service';
import { mockUserService } from '../../../test/mocks/providers/mock_user_service';
import { SUCCESS_CODE } from '../../common/codes/success-codes';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    const name = 'John Doe';
    const email = 'john@example.com';
    const extAuthUID = '1234';
    it('should return a success response when the user is created', async () => {
      const req = {
        user: { name, email, external_auth_uid: extAuthUID },
      } as AuthenticatedRequestForNewUser;
      const serviceSpy = jest
        .spyOn(userService, 'createUser')
        .mockResolvedValue(undefined);

      const result = await controller.createUser(req);
      expect(serviceSpy).toHaveBeenCalledWith(name, email, extAuthUID);
      expect(result).toEqual({ message: '', code: SUCCESS_CODE.UserCreated });
    });
    it('should propagate any error thrown by userService.createUser', async () => {
      const req = {
        user: { name, email, external_auth_uid: extAuthUID },
      } as AuthenticatedRequestForNewUser;
      jest
        .spyOn(userService, 'createUser')
        .mockRejectedValue(new Error('Test error'));
      await expect(controller.createUser(req)).rejects.toThrow('Test error');
    });
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

  describe('verifyEmail', () => {
    const userId = '123';
    it('should call userService.updateUser with the correct args and return a success response', async () => {
      const req = {
        user: { id: userId, internalUserEmailVerificationStatus: false },
      } as AuthenticatedRequest;
      const spy = jest
        .spyOn(userService, 'updateUser')
        .mockResolvedValue(undefined);
      const result = await controller.verifyEmail(req);
      expect(result).toEqual({ message: '', code: SUCCESS_CODE.EmailVerified });
      expect(spy).toHaveBeenCalledWith(userId, { emailVerified: true });
    });
    it('should not call userService.updateUser if internal email already verified and should return a success response', async () => {
      const req = {
        user: { id: userId, internalUserEmailVerificationStatus: true },
      } as AuthenticatedRequest;
      const spy = jest.spyOn(userService, 'updateUser');
      const result = await controller.verifyEmail(req);
      expect(result).toEqual({ message: '', code: SUCCESS_CODE.EmailVerified });
      expect(spy).not.toHaveBeenCalled();
    });
    it('should propagate any error thrown by userService.updateUser', async () => {
      const req = { user: { id: userId } } as AuthenticatedRequest;
      jest
        .spyOn(userService, 'updateUser')
        .mockRejectedValue(new Error('Test error'));
      await expect(controller.verifyEmail(req)).rejects.toThrow('Test error');
    });
  });
});
