import { Test, TestingModule } from '@nestjs/testing';
import { SecretManagerService } from './secret-manager.service';
import { GcpSecretManagerService } from '../../../external-modules/gcp-secret-manager/gcp-secret-manager.service';
import { CustomConfigService } from '../../../utility/services/custom-config/custom-config.service';
import { mockGcpSecretManagerService } from '../../../../test/mocks/providers/mock_gcp_secret_manager';
import * as fs from 'fs/promises'; // Mock fs module for local file handling
jest.mock('fs/promises');

describe('SecretManagerService', () => {
  let service: SecretManagerService;
  let cloudSecretManagerService: GcpSecretManagerService;

  // Dynamic setup function - MUST be called at the start of EVERY test (it functions like beforeEach, only dynamically)
  const setupTestEnvironment = async (isLocal: boolean) => {
    jest.clearAllMocks();

    const mockCustomConfig = {
      getEnvVariable: jest
        .fn()
        .mockReturnValueOnce(isLocal)
        .mockReturnValue('string'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecretManagerService,
        {
          provide: GcpSecretManagerService,
          useValue: mockGcpSecretManagerService,
        },
        { provide: CustomConfigService, useValue: mockCustomConfig },
      ],
    }).compile();

    service = module.get<SecretManagerService>(SecretManagerService);
    cloudSecretManagerService = module.get<GcpSecretManagerService>(
      GcpSecretManagerService,
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    await setupTestEnvironment(false);
    expect(service).toBeDefined();
  });

  describe('getSecretName', () => {
    it('should format the secret name correctly', () => {
      const secretName = service.getSecretName(
        'companyId',
        'companyIntegrationId',
        'secretType',
      );
      expect(secretName).toBe('companyId_companyIntegrationId_secretType');
    });
  });

  describe('getSecret', () => {
    const secretName = 'test_secret';
    const secretValue = 'secretValue';

    it('should read secret from local file when running locally', async () => {
      await setupTestEnvironment(true);
      (fs.readFile as jest.Mock).mockResolvedValue(secretValue);
      const result = await service.getSecret(secretName);
      expect(result).toEqual(secretValue);
      expect(fs.readFile).toHaveBeenCalled();
    });

    it('should handle secret retrieval in cloud', async () => {
      await setupTestEnvironment(false);
      jest
        .spyOn(cloudSecretManagerService, 'getSecret')
        .mockResolvedValue(secretValue);
      const result = await service.getSecret(secretName);
      expect(result).toEqual(secretValue);
      expect(cloudSecretManagerService.getSecret).toHaveBeenCalledWith(
        secretName,
      );
    });

    it('should throw error for local environment when file read fails', async () => {
      await setupTestEnvironment(true);
      (fs.readFile as jest.Mock).mockRejectedValue(
        new Error('File read error'),
      );
      await expect(service.getSecret(secretName)).rejects.toThrow(
        'File read error',
      );
    });
  });

  describe('upsertSecret', () => {
    const secretName = 'upsert_secret';
    const secretValue = Buffer.from('newSecretValue');

    it('should upsert secret in cloud', async () => {
      await setupTestEnvironment(false);
      const spy = jest
        .spyOn(cloudSecretManagerService, 'upsertSecret')
        .mockResolvedValue(undefined);
      const result = await service.upsertSecret(secretName, secretValue);
      expect(result).toBe(undefined);
      expect(spy).toHaveBeenCalledWith(secretName, secretValue);
    });

    it('should propagate any error thrown by cloud secret manager provider', async () => {
      await setupTestEnvironment(false);
      jest
        .spyOn(cloudSecretManagerService, 'upsertSecret')
        .mockRejectedValue(new Error('Test error'));

      await expect(
        service.upsertSecret(secretName, secretValue),
      ).rejects.toThrow('Test error');
    });

    it('should throw error when trying to upsert locally', async () => {
      await setupTestEnvironment(true);
      await expect(
        service.upsertSecret(secretName, secretValue),
      ).rejects.toThrow('Upserting secrets locally not allowed');
    });
  });
});
