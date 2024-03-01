import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAdminService } from '../../../external-modules/firebase-admin/firebase-admin.service';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../../internal-modules/user/user.service';
import { mockFirebaseAdminService } from '../../../../test/mocks/providers/mock_firebase_admin';
import { mockUserService } from '../../../../test/mocks/providers/mock_user_service';
import { ForbiddenException } from '@nestjs/common';
import { ERROR_CODE } from '../../codes/error-codes';
import { LoginGuard } from './login.guard';
import { GuardService } from '../guard/guard.service';
import { mockGuardService } from '../../../../test/mocks/providers/mock_guard_service';

describe('LoginGuard', () => {
  let guard: LoginGuard;
  // let firebaseAdminService: FirebaseAdminService;
  let guardService: GuardService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginGuard,
        // { provide: FirebaseAdminService, useValue: mockFirebaseAdminService },
        { provide: GuardService, useValue: mockGuardService },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    guard = module.get<LoginGuard>(LoginGuard);
    // firebaseAdminService =
    //   module.get<FirebaseAdminService>(FirebaseAdminService);
    guardService = module.get<GuardService>(GuardService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return false if no token is provided', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ headers: {} }),
        }),
      };

      expect(await guard.canActivate(context as any)).toBe(false);
    });
    it('should return true if user found', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest
            .fn()
            .mockReturnValue({ headers: { authorization: 'Bearer token' } }),
        }),
      };
      jest.spyOn(firebaseAdminService, 'verifyToken').mockResolvedValue({
        email: 'email',
        email_verified: true,
        uid: '123',
      } as any);
      jest
        .spyOn(userService, 'getUserByExternalUID')
        .mockResolvedValue({ accountId: '123' } as any);

      const result = await guard.canActivate(context as any);
      expect(result).toBe(true);
    });
    it('should return true if user not found', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest
            .fn()
            .mockReturnValue({ headers: { authorization: 'Bearer token' } }),
        }),
      };
      jest.spyOn(firebaseAdminService, 'verifyToken').mockResolvedValue({
        name: 'John Doe',
        email: 'email',
        email_verified: true,
        uid: '123',
      } as any);
      jest.spyOn(userService, 'getUserByExternalUID').mockResolvedValue(null);

      const result = await guard.canActivate(context as any);
      expect(result).toBe(true);
    });
    it('should return false if firebaseAdminService errors', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest
            .fn()
            .mockReturnValue({ headers: { authorization: 'Bearer token' } }),
        }),
      };
      jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockRejectedValue(new Error('Test error'));

      const result = await guard.canActivate(context as any);
      expect(result).toBe(false);
      expect(userService.getUserByExternalUID).not.toHaveBeenCalled();
    });
    it('should return false if userService.getUserByExternalUID errors', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest
            .fn()
            .mockReturnValue({ headers: { authorization: 'Bearer token' } }),
        }),
      };
      jest.spyOn(firebaseAdminService, 'verifyToken').mockResolvedValue({
        email: 'email',
        email_verified: true,
        uid: '123',
      } as any);
      jest
        .spyOn(userService, 'getUserByExternalUID')
        .mockRejectedValue(new Error('Test error'));

      const result = await guard.canActivate(context as any);
      expect(result).toBe(false);
      expect(firebaseAdminService.verifyToken).toHaveBeenCalled();
    });
    it('should throw ForbiddenException "MalformedToken" error if user not found and payload does not include email', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest
            .fn()
            .mockReturnValue({ headers: { authorization: 'Bearer token' } }),
        }),
      };
      jest.spyOn(firebaseAdminService, 'verifyToken').mockResolvedValue({
        email_verified: true,
        uid: '123',
      } as any);
      jest.spyOn(userService, 'getUserByExternalUID').mockResolvedValue(null);

      try {
        await guard.canActivate(context as any);
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.response.code).toBe(ERROR_CODE.MalformedToken);
      }
    });
    it('should throw ForbiddenException "MalformedToken" error if user not found and payload includes non-string "name" property', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest
            .fn()
            .mockReturnValue({ headers: { authorization: 'Bearer token' } }),
        }),
      };
      jest.spyOn(firebaseAdminService, 'verifyToken').mockResolvedValue({
        name: 123,
        email: 'email',
        email_verified: true,
        uid: '123',
      } as any);
      jest.spyOn(userService, 'getUserByExternalUID').mockResolvedValue(null);

      try {
        await guard.canActivate(context as any);
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.response.code).toBe(ERROR_CODE.MalformedToken);
      }
    });
  });
});
