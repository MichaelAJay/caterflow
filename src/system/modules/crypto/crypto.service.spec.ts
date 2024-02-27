import { Test, TestingModule } from '@nestjs/testing';
import { CryptoService } from './crypto.service';
import { SecretManagerService } from '../../../internal-modules/external-handlers/secret-manager/secret-manager.service';
import { mockSecretManagerService } from '../../../../test/mocks/providers/mock_secret_manager';

jest.mock('crypto', () => {
  const originalCrypto = jest.requireActual('crypto');
  return {
    ...originalCrypto,
    randomBytes: jest.fn().mockReturnValue(Buffer.alloc(16, 'a')),
    createCipheriv: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue('encrypted'),
      final: jest.fn().mockReturnValue(''),
    }),
    createDecipheriv: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue('decrypted'),
      final: jest.fn().mockReturnValue(''),
    }),
    // createHash: jest.fn().mockReturnValue(mockHash),
  };
});

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    mockSecretManagerService.getSecret = jest
      .fn()
      .mockResolvedValue('MBlW82izU6LiQ1aUWS3ubx+m8UZars3MF2U42OAFfY0=');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        { provide: SecretManagerService, useValue: mockSecretManagerService },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('encrypt', () => {
    it('should encrypt the text', async () => {
      const text = 'test';
      const encryptedText = 'encrypted';
      const result = await service.encrypt(text);
      expect(result).toBe(
        `${Buffer.alloc(16, 'a').toString('hex')}:${encryptedText}`,
      );
    });
  });

  describe('decrypt', () => {
    it('should decrypt the text', async () => {
      const text = `${Buffer.alloc(16, 'a').toString('hex')}:encrypted`;
      const decryptedText = 'decrypted';
      const result = await service.decrypt(text);
      expect(result).toBe(decryptedText);
    });
  });
  // Trying to mock createHash is breaking the whole test suite. Deferring
  // describe('hash', () => {
  //   it('should hash the text', async () => {
  //     const text = 'test';
  //     const result = await service.hash(text);
  //     expect(result).toBe('hashed');
  //   });

  //   it('should trim and convert the text to lower case before hashing', async () => {
  //     const text = ' TeSt ';
  //     const result = await service.hash(text);
  //     expect(result).toBe('hashed');
  //   });
  // });
});
