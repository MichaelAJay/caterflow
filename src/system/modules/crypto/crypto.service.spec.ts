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
      update: jest.fn().mockReturnValue(Buffer.from('encrypted')),
      final: jest.fn().mockReturnValue(Buffer.from('')),
    }),
  };
});

describe('CryptoService', () => {
  let service: CryptoService;
  let mockCreateCipheriv: jest.Mock;

  beforeEach(async () => {
    mockCreateCipheriv = jest.fn();

    jest.mock('crypto', () => ({
      createCipheriv: mockCreateCipheriv,
    }));

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('encrypt', () => {
    it('should encrypt the text', async () => {
      const text = 'test';
      const encryptedText = 'encrypted';

      const mockCipher = {
        update: jest.fn().mockReturnValue(encryptedText),
        final: jest.fn().mockReturnValue(Buffer.from('')),
      };

      mockCreateCipheriv.mockReturnValue(mockCipher);

      const result = await service.encrypt(text);
      expect(result).toBe(
        `${Buffer.alloc(16, 'a').toString('hex')}:${encryptedText}`,
      );
    });
  });
});
