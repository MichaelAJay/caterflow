import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../../internal-modules/user/user.service';
import { mockUserService } from '../../../../test/mocks/providers/mock_user_service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ERROR_CODE } from '../../codes/error-codes';
import { LoginGuard } from './login.guard';
import { GuardService } from '../guard/guard.service';
import { mockGuardService } from '../../../../test/mocks/providers/mock_guard_service';

describe('LoginGuard', () => {
  let guard: LoginGuard;
  let guardService: GuardService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginGuard,
        { provide: GuardService, useValue: mockGuardService },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    guard = module.get<LoginGuard>(LoginGuard);
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
    it('should throw Unauthorized "MissingToken" error if authorization header is not correct', async () => {
      expect.assertions(2);

      const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ headers: {} }),
        }),
      };

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
      jest.spyOn(guardService, 'verifyToken').mockResolvedValue({
        email: 'email',
        email_verified: true,
        uid: '123',
      } as any);
      jest
        .spyOn(userService, 'getUserByExternalUID')
        .mockResolvedValue({ companyId: '123' } as any);

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
      jest.spyOn(guardService, 'verifyToken').mockResolvedValue({
        name: 'John Doe',
        email: 'email',
        email_verified: true,
        uid: '123',
      } as any);
      jest.spyOn(userService, 'getUserByExternalUID').mockResolvedValue(null);

      const result = await guard.canActivate(context as any);
      expect(result).toBe(true);
    });
    it('should return false if guardService throws unspecified error', async () => {
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
        .spyOn(guardService, 'verifyToken')
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
      jest.spyOn(guardService, 'verifyToken').mockResolvedValue({
        email: 'email',
        email_verified: true,
        uid: '123',
      } as any);
      jest
        .spyOn(userService, 'getUserByExternalUID')
        .mockRejectedValue(new Error('Test error'));

      const result = await guard.canActivate(context as any);
      expect(result).toBe(false);
      expect(guardService.verifyToken).toHaveBeenCalled();
    });
    it('should propagate ForbiddenException "MalformedToken" error from guardService.verifyToken', async () => {
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
  });
});
