import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { FirebaseAdminService } from '../../../external-modules/firebase-admin/firebase-admin.service';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../../internal-modules/user/user.service';
import { mockFirebaseAdminService } from '../../../../test/mocks/providers/mock_firebase_admin';
import { mockUserService } from '../../../../test/mocks/providers/mock_user_service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let firebaseAdminService: FirebaseAdminService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: FirebaseAdminService, useValue: mockFirebaseAdminService },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    firebaseAdminService =
      module.get<FirebaseAdminService>(FirebaseAdminService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if the route is public', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({ getRequest: jest.fn() }),
      };
      jest.spyOn(guard['reflector'], 'getAllAndOverride').mockReturnValue(true);

      expect(await guard.canActivate(context as any)).toBe(true);
    });

    it('should return true when token is valid, user is found and has an associated account', async () => {
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
        .spyOn(guard['reflector'], 'getAllAndOverride')
        .mockReturnValue(false); // First call to getAllAndOverride
      jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockResolvedValue({ email_verified: true, uid: '123' } as any);
      jest
        .spyOn(userService, 'getUserByExternalUID')
        .mockResolvedValue({ accountId: '123' } as any);

      const result = await guard.canActivate(context as any);
      expect(result).toBe(true);
    });

    it('should return false if no token is provided', async () => {
      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ headers: {} }),
        }),
      };
      jest
        .spyOn(guard['reflector'], 'getAllAndOverride')
        .mockReturnValue(false);

      expect(await guard.canActivate(context as any)).toBe(false);
    });

    it('should throw UnauthorizedException if firebaseAdminService.verifyToken rejects with "id-token-expired"', async () => {
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
        .spyOn(guard['reflector'], 'getAllAndOverride')
        .mockReturnValue(false);
      jest.spyOn(firebaseAdminService, 'verifyToken').mockImplementation(() => {
        const error: Error & { code?: string } = new Error('Token expired');
        error['code'] = 'auth/id-token-expired';
        throw error;
      });

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return false if firebaseAdminService.verifyToken rejects with an unspecified error', async () => {
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
        .spyOn(guard['reflector'], 'getAllAndOverride')
        .mockReturnValue(false);
      jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockRejectedValue(new Error());
      expect(await guard.canActivate(context as any)).toBe(false);
    });

    it('should throw a ForbiddenException if the email is not verified', async () => {
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
        .spyOn(guard['reflector'], 'getAllAndOverride')
        .mockReturnValue(false);
      jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockResolvedValue({ email_verified: false } as any);

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return false for an unspecified error thrown by userService.getUserByExternalUID', async () => {
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
        .spyOn(guard['reflector'], 'getAllAndOverride')
        .mockReturnValue(false);
      jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockResolvedValue({ email_verified: true } as any);
      jest
        .spyOn(userService, 'getUserByExternalUID')
        .mockRejectedValue(new Error('Test error'));

      expect(await guard.canActivate(context as any)).toBe(false);
    });

    it('should return false for an unspecified error thrown by userService.getUserByExternalUID', async () => {
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
        .spyOn(guard['reflector'], 'getAllAndOverride')
        .mockReturnValue(false);
      jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockResolvedValue({ email_verified: true } as any);
      jest.spyOn(userService, 'getUserByExternalUID').mockResolvedValue(null);

      expect(await guard.canActivate(context as any)).toBe(false);
    });

    it('should throw a ForbiddenException if the user has no account and cannot skip the account check', async () => {
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
        .spyOn(guard['reflector'], 'getAllAndOverride')
        .mockImplementationOnce(() => false) // First call to getAllAndOverride
        .mockImplementationOnce(() => false); // Second call to getAllAndOverride
      jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockResolvedValue({ email_verified: true, uid: '123' } as any);
      jest
        .spyOn(userService, 'getUserByExternalUID')
        .mockResolvedValue({ accountId: null } as any);

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return true when the user has no account but can skip the account check', async () => {
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
        .spyOn(guard['reflector'], 'getAllAndOverride')
        .mockImplementationOnce(() => false) // First call to getAllAndOverride
        .mockImplementationOnce(() => true); // Second call to getAllAndOverride
      jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockResolvedValue({ email_verified: true, uid: '123' } as any);
      jest
        .spyOn(userService, 'getUserByExternalUID')
        .mockResolvedValue({} as any);

      const result = await guard.canActivate(context as any);
      expect(result).toBe(true);
    });
  });
});
