import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAdminService } from './firebase-admin.service';
import * as admin from 'firebase-admin';

const mockAuth = {
  verifyIdToken: jest.fn(() => Promise.resolve({ uid: 'testUser' })),
};

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    applicationDefault: jest.fn(),
  },
  auth: jest.fn(() => mockAuth),
}));

describe('FirebaseAdminService', () => {
  let service: FirebaseAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseAdminService],
    }).compile();

    service = module.get<FirebaseAdminService>(FirebaseAdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize Firebase app with default credentials', async () => {
      await service.onModuleInit();
      expect(admin.initializeApp).toHaveBeenCalledWith({
        credential: admin.credential.applicationDefault(),
        projectId: 'caterflow-df55f',
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify token successfully', async () => {
      const token = 'validToken';
      const decodedToken = await service.verifyToken(token);
      expect(decodedToken).toEqual({ uid: 'testUser' });
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
    });

    it('should throw an error if token verification fails', async () => {
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));
      const token = 'invalid token';
      await expect(service.verifyToken(token)).rejects.toThrow('Invalid token');
    });
  });
});
