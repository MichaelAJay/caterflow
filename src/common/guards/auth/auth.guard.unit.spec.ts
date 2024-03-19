import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../../internal-modules/user/user.service';
import { mockUserService } from '../../../../test/mocks/providers/mock_user_service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ERROR_CODE } from '../../codes/error-codes';
import { GuardService } from '../guard/guard.service';
import { mockGuardService } from '../../../../test/mocks/providers/mock_guard_service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let guardService: GuardService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: GuardService, useValue: mockGuardService },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
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
      jest.spyOn(guardService, 'verifyToken').mockResolvedValue({
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

    it('should return false if no token is provided', async () => {
      expect.assertions(2);

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
      jest
        .spyOn(guardService, 'verifyToken')
        .mockRejectedValue(
          new UnauthorizedException({ code: ERROR_CODE.MissingToken }),
        );
      try {
        await guard.canActivate(context as any);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.response.code).toBe(ERROR_CODE.MissingToken);
      }
    });

    it('should throw UnauthorizedException if guardService.verifyToken rejects with "id-token-expired"', async () => {
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
      jest.spyOn(guardService, 'verifyToken').mockImplementation(() => {
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
      jest.spyOn(guardService, 'verifyToken').mockRejectedValue(new Error());
      expect(await guard.canActivate(context as any)).toBe(false);
    });

    it('should throw MalformedToken ForbiddenException if the token payload does not include email', async () => {
      expect.assertions(2);

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
      // jest.spyOn(guardService, 'verifyToken').mockResolvedValue({
      //   email_verified: false,
      //   email: undefined,
      // } as any);
      jest
        .spyOn(guardService, 'verifyToken')
        .mockRejectedValue(
          new ForbiddenException({ code: ERROR_CODE.MalformedToken }),
        );

      try {
        await guard.canActivate(context as any);
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.response.code).toBe(ERROR_CODE.MalformedToken);
      }
    });

    it('should throw a ForbiddenException if the email is not verified and email verified check cannot be bypassed', async () => {
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
        .spyOn(guardService, 'verifyToken')
        .mockResolvedValue({ email: 'email', email_verified: false } as any);

      await expect(guard.canActivate(context as any)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should not throw the UnverifiedEmail ForbiddenException if email is not verified but email verified check can be bypasses', async () => {
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
        .mockReturnValueOnce(false) // Is not public
        .mockReturnValueOnce(false) // Is not login
        .mockReturnValue(true); // Can skip email verification
      jest
        .spyOn(guardService, 'verifyToken')
        .mockResolvedValue({ email: 'email', email_verified: false } as any);
      const spy = jest.spyOn(userService, 'getUserByExternalUID');

      await guard.canActivate(context as any);
      // If spy is called, then UnverifiedEmail ForbiddenException was not thrown
      expect(spy).toHaveBeenCalled();
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
        .spyOn(guardService, 'verifyToken')
        .mockResolvedValue({ email: 'email', email_verified: true } as any);
      jest
        .spyOn(userService, 'getUserByExternalUID')
        .mockRejectedValue(new Error('Test error'));

      expect(await guard.canActivate(context as any)).toBe(false);
    });

    it('should return true if the user is not found and bypass user requirement is set to true', async () => {
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
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      jest.spyOn(guardService, 'verifyToken').mockResolvedValue({
        email: 'email',
        email_verified: true,
        name: 'name',
      } as any);
      jest.spyOn(userService, 'getUserByExternalUID').mockResolvedValue(null);

      expect(await guard.canActivate(context as any)).toBe(true);
    });

    it('should throw MalformedToken Forbidden error if user is not found, bypass user requirement is set to true, and payload is missing "name"', async () => {
      expect.assertions(2);

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
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true);
      jest
        .spyOn(guardService, 'verifyToken')
        .mockRejectedValue(
          new ForbiddenException({ code: ERROR_CODE.MalformedToken }),
        );

      try {
        await guard.canActivate(context as any);
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.response.code).toBe(ERROR_CODE.MalformedToken);
      }
    });

    it('should return false if the user is not found and bypass user requirement is not set to true', async () => {
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
        .spyOn(guardService, 'verifyToken')
        .mockResolvedValue({ email: 'email', email_verified: true } as any);
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
      jest.spyOn(guardService, 'verifyToken').mockResolvedValue({
        email: 'email',
        email_verified: true,
        uid: '123',
      } as any);
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
      jest.spyOn(guardService, 'verifyToken').mockResolvedValue({
        email_verified: true,
        uid: '123',
        email: 'email',
      } as any);
      jest
        .spyOn(userService, 'getUserByExternalUID')
        .mockResolvedValue({} as any);

      const result = await guard.canActivate(context as any);
      expect(result).toBe(true);
    });
  });
});
