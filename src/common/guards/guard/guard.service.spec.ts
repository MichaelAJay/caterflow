import { Test, TestingModule } from '@nestjs/testing';
import { GuardService } from './guard.service';
import { FirebaseAdminService } from '../../../external-modules/firebase-admin/firebase-admin.service';
import { mockFirebaseAdminService } from '../../../../test/mocks/providers/mock_firebase_admin';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ERROR_CODE } from '../../../common/codes/error-codes';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

describe('GuardService', () => {
  let service: GuardService;
  let firebaseAdminService: FirebaseAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuardService,
        { provide: FirebaseAdminService, useValue: mockFirebaseAdminService },
      ],
    }).compile();

    service = module.get<GuardService>(GuardService);
    firebaseAdminService =
      module.get<FirebaseAdminService>(FirebaseAdminService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyToken', () => {
    const validPayload = {
      email_verified: false,
      uid: '123',
      name: 'John Doe',
      email: 'john@example.com',
    } as unknown as DecodedIdToken;

    it('should return the validated payload', async () => {
      const token = 'token';
      const req = { headers: { authorization: `Bearer ${token}` } };
      const verifyTokenSpy = jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockResolvedValue(validPayload);

      const verifyPayloadSpy = jest
        .spyOn(service, 'isVerifiedPayload')
        .mockReturnValue(true);

      const result = await service.verifyToken(req);
      expect(result).toEqual(validPayload);
      expect(verifyTokenSpy).toHaveBeenCalledWith(token);
      expect(verifyPayloadSpy).toHaveBeenCalledWith(validPayload);
    });
    it('should throw "MissingToken" forbidden exception if request doesn\'t include a valid bearer token', async () => {
      expect.assertions(2);

      const req = { headers: {} };
      try {
        await service.verifyToken(req);
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
        expect(err.response.code).toBe(ERROR_CODE.MissingToken);
      }
    });
    it('should propagate any error thrown by verifyToken', async () => {
      const token = 'token';
      const req = { headers: { authorization: `Bearer ${token}` } };
      jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockRejectedValue(new Error('Test error'));
      await expect(service.verifyToken(req)).rejects.toThrow('Test error');
    });
    it('should throw "MalformedToken" ForbiddenException if "isVerifiedPayload" returns false', async () => {
      expect.assertions(2);

      const token = 'token';
      const req = { headers: { authorization: `Bearer ${token}` } };
      jest
        .spyOn(firebaseAdminService, 'verifyToken')
        .mockResolvedValue(validPayload);

      jest.spyOn(service, 'isVerifiedPayload').mockReturnValue(false);

      try {
        await service.verifyToken(req);
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect(err.response.code).toBe(ERROR_CODE.MalformedToken);
      }
    });
  });

  describe('isVerifiedPayload', () => {
    const validPayload = {
      email_verified: false,
      uid: '123',
      name: 'John Doe',
      email: 'john@example.com',
    } as unknown as DecodedIdToken;
    it('should return true if payload is verified', () => {
      const result = service.isVerifiedPayload(validPayload);
      expect(result).toBe(true);
    });
    it('should return false if payload is not an object', () => {
      const result = service.isVerifiedPayload('invalid');
      expect(result).toBe(false);
    });
    it('should return false if payload is null', () => {
      const result = service.isVerifiedPayload(null);
      expect(result).toBe(false);
    });
    it('should return false if name property is not a string', () => {
      const result = service.isVerifiedPayload({
        ...validPayload,
        name: 123,
      });
      expect(result).toBe(false);
    });
    it('should return true if name property is empty string', () => {
      const result = service.isVerifiedPayload({
        ...validPayload,
        name: '',
      });
      expect(result).toBe(true);
    });
    it('should return false if email property is undefined', () => {
      const result = service.isVerifiedPayload({
        ...validPayload,
        email: undefined,
      });
      expect(result).toBe(false);
    });
  });
});
