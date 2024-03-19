import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { UserService } from '../../internal-modules/user/user.service';
import { mockUserService } from '../../../test/mocks/providers/mock_user_service';
import { SUCCESS_CODE } from '../../common/codes/success-codes';
import {
  UserFoundLoginRequest,
  UserNotFoundLoginRequest,
} from '../interfaces/login-request.interface';
import { mockGuardService } from '../../../test/mocks/providers/mock_guard_service';
import { GuardService } from '../../common/guards/guard/guard.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: GuardService, useValue: mockGuardService },
      ],
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

  // describe('createUser', () => {
  //   const name = 'John Doe';
  //   const email = 'john@example.com';
  //   const extAuthUID = '1234';
  //   it('should return a success response when the user is created', async () => {
  //     const req = {
  //       user: { name, email, external_auth_uid: extAuthUID },
  //     } as AuthenticatedRequestForNewUser;
  //     const serviceSpy = jest
  //       .spyOn(userService, 'createUser')
  //       .mockResolvedValue(undefined);

  //     const result = await controller.createUser(req);
  //     expect(serviceSpy).toHaveBeenCalledWith(name, email, extAuthUID);
  //     expect(result).toEqual({ message: '', code: SUCCESS_CODE.UserCreated });
  //   });
  //   it('should propagate any error thrown by userService.createUser', async () => {
  //     const req = {
  //       user: { name, email, external_auth_uid: extAuthUID },
  //     } as AuthenticatedRequestForNewUser;
  //     jest
  //       .spyOn(userService, 'createUser')
  //       .mockRejectedValue(new Error('Test error'));
  //     await expect(controller.createUser(req)).rejects.toThrow('Test error');
  //   });
  // });

  // describe('getUserAccountStatus', () => {
  //   it('should return user account status true when user has account id', async () => {
  //     const req = {
  //       user: { id: 'testId', accountId: 'acctId' },
  //     } as AuthenticatedRequest;
  //     const result = await controller.getUserAccountStatus(req);
  //     expect(result).toEqual({ hasAccount: true });
  //   });
  //   it('should return user account status false when user does not have account id', async () => {
  //     const req = {
  //       user: { id: 'testId' },
  //     } as AuthenticatedRequest;
  //     const result = await controller.getUserAccountStatus(req);
  //     expect(result).toEqual({ hasAccount: false });
  //   });
  //   it('should return user account status false when req does not have user', async () => {
  //     const req = {} as AuthenticatedRequest;
  //     const result = await controller.getUserAccountStatus(req);
  //     expect(result).toEqual({ hasAccount: false });
  //   });
  // });

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

  describe('login', () => {
    it('should return an object with hasAccount property and not call createUser if req.userFound is true', async () => {
      const req = {
        userFound: true,
        userHasAccount: true,
      } as UserFoundLoginRequest;
      const result = await controller.login(req);
      expect(result).toEqual({ hasAccount: req.userHasAccount });
      expect(userService.createUser).not.toHaveBeenCalled();
    });
    it('should call userService.updateUser to update emailVerified if user found and requires sync', async () => {
      const req = {
        userId: '123',
        userFound: true,
        userHasAccount: true,
        requiresEmailVerificationSync: true,
      } as UserFoundLoginRequest;
      const spy = jest
        .spyOn(userService, 'updateUser')
        .mockResolvedValue(undefined);

      await controller.login(req);
      expect(spy).toHaveBeenCalledWith(req.userId, { emailVerified: true });
    });
    it('should not call userService.updateUser if user found and not requires sync', async () => {
      const req = {
        userId: '123',
        userFound: true,
        userHasAccount: true,
        requiresEmailVerificationSync: false,
      } as UserFoundLoginRequest;
      const spy = jest.spyOn(userService, 'updateUser');

      await controller.login(req);
      expect(spy).not.toHaveBeenCalled();
    });
    it('should call userService.createUser with the correct args if req.userFound is false and email not verified', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        external_auth_uid: '123',
        emailVerified: false,
      };
      const req = { userFound: false, user } as UserNotFoundLoginRequest;
      const spy = jest
        .spyOn(userService, 'createUser')
        .mockResolvedValue(undefined);
      const result = await controller.login(req);
      expect(result).toEqual({ hasAccount: false });
      expect(spy).toHaveBeenCalledWith(
        user.name,
        user.email,
        user.external_auth_uid,
        user.emailVerified,
      );
    });
    it('should call userService.createUser with the correct args if req.userFound is false and email verified', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        external_auth_uid: '123',
        emailVerified: true,
      };
      const req = { userFound: false, user } as UserNotFoundLoginRequest;
      const spy = jest
        .spyOn(userService, 'createUser')
        .mockResolvedValue(undefined);
      const result = await controller.login(req);
      expect(result).toEqual({ hasAccount: false });
      expect(spy).toHaveBeenCalledWith(
        user.name,
        user.email,
        user.external_auth_uid,
        user.emailVerified,
      );
    });
    it('should propagate any error thrown by userService.createUser', async () => {
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        external_auth_uid: '123',
      };
      const req = { userFound: false, user } as UserNotFoundLoginRequest;
      jest
        .spyOn(userService, 'createUser')
        .mockRejectedValue(new Error('Test error'));
      await expect(controller.login(req)).rejects.toThrow('Test error');
    });
  });
});
