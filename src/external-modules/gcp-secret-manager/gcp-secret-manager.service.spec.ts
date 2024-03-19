import { Test, TestingModule } from '@nestjs/testing';
import { GcpSecretManagerService } from './gcp-secret-manager.service';
import { CustomConfigService } from '../../utility/services/custom-config/custom-config.service';
import { mockCustomConfig } from '../../../test/mocks/providers/mock_custom_config';

const MOCK_PROJECT_ID = 'mockProjectId';
const MOCK_SECRET_PREFIX = `projects/${MOCK_PROJECT_ID}/secrets`;

const mockSecretManagerServiceClient = {
  accessSecretVersion: jest.fn(),
  createSecret: jest.fn(),
  addSecretVersion: jest.fn(),
  getSecret: jest.fn(),
  deleteSecret: jest.fn(),
};

jest.mock('@google-cloud/secret-manager', () => ({
  SecretManagerServiceClient: jest.fn(() => mockSecretManagerServiceClient),
}));

describe('GcpSecretManagerService', () => {
  let service: GcpSecretManagerService;

  beforeEach(async () => {
    mockCustomConfig.getEnvVariable = jest
      .fn()
      .mockReturnValue(MOCK_PROJECT_ID);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GcpSecretManagerService,
        { provide: CustomConfigService, useValue: mockCustomConfig },
      ],
    }).compile();

    service = module.get<GcpSecretManagerService>(GcpSecretManagerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSecret', () => {
    it('should retrieve a secret successfully', async () => {
      const secretName = 'testSecret';
      const secretData = 'secretValue';
      mockSecretManagerServiceClient.accessSecretVersion.mockResolvedValue([
        { payload: { data: Buffer.from(secretData) } },
      ]);

      const result = await service.getSecret(secretName);
      expect(result).toEqual(secretData);
      expect(
        mockSecretManagerServiceClient.accessSecretVersion,
      ).toHaveBeenCalledWith({
        name: `projects/${MOCK_PROJECT_ID}/secrets/${secretName}/versions/latest`,
      });
    });
    it('should throw an error if the secret is not found or has no data', async () => {
      const secretName = 'nonExistentSecret';
      mockSecretManagerServiceClient.accessSecretVersion.mockResolvedValue([
        { payload: {} },
      ]);
      await expect(service.getSecret(secretName)).rejects.toThrow(
        `Secret ${secretName} not found or has no data.`,
      );
    });
    it('should throw an error if the API call fails', async () => {
      const secretName = 'testSecret';
      const errorMessage = 'API Error';
      mockSecretManagerServiceClient.accessSecretVersion.mockRejectedValue(
        new Error(errorMessage),
      );
      await expect(service.getSecret(secretName)).rejects.toThrow(errorMessage);
    });
  });
  describe('upsertSecret', () => {
    it('should create a new secret if it does not exist', async () => {
      const secretName = 'newSecret';
      const secretValue = Buffer.from('newValue');
      const secretPath = `${MOCK_SECRET_PREFIX}/${secretName}`;

      mockSecretManagerServiceClient.getSecret.mockRejectedValue({ code: 5 });
      const createSecretSpy = jest
        .spyOn(mockSecretManagerServiceClient, 'createSecret')
        .mockResolvedValue({});
      const addSecretVersionSpy = jest
        .spyOn(mockSecretManagerServiceClient, 'addSecretVersion')
        .mockResolvedValue({});
      await service.upsertSecret(secretName, secretValue);
      expect(createSecretSpy).toHaveBeenCalled();
      expect(addSecretVersionSpy).toHaveBeenCalledWith({
        parent: secretPath,
        payload: { data: secretValue },
      });
    });
    it('should add a new version to an existing secret', async () => {
      const secretName = 'existingSecret';
      const secretValue = Buffer.from('updatedValue');
      const secretPath = `${MOCK_SECRET_PREFIX}/${secretName}`;

      const getSecretSpy = jest
        .spyOn(mockSecretManagerServiceClient, 'getSecret')
        .mockResolvedValue({});
      const addSecretVersionSpy = jest
        .spyOn(mockSecretManagerServiceClient, 'addSecretVersion')
        .mockResolvedValue({});

      await service.upsertSecret(secretName, secretValue);
      expect(getSecretSpy).toHaveBeenCalled();
      expect(addSecretVersionSpy).toHaveBeenCalledWith({
        parent: secretPath,
        payload: { data: secretValue },
      });
    });
    it('should throw an error if getSecret fails with an error other than not found', async () => {
      const secretName = 'problemSecret';
      const secretValue = Buffer.from('value');
      const expectedError = new Error('Test error') as unknown as Error & {
        code: number;
      };
      expectedError.code = 4;
      mockSecretManagerServiceClient.getSecret.mockRejectedValue(expectedError);

      await expect(
        service.upsertSecret(secretName, secretValue),
      ).rejects.toThrow('Test error');
    });
    it('should throw an error if createSecret fails', async () => {
      const secretName = 'newSecret';
      const secretValue = Buffer.from('newValue');

      mockSecretManagerServiceClient.getSecret.mockRejectedValue({ code: 5 });
      mockSecretManagerServiceClient.createSecret.mockRejectedValue(
        new Error('Test error'),
      );
      await expect(
        service.upsertSecret(secretName, secretValue),
      ).rejects.toThrow('Test error');
    });
    it('should throw an error if addSecretVersion fails', async () => {
      const secretName = 'newSecret';
      const secretValue = Buffer.from('newValue');

      mockSecretManagerServiceClient.addSecretVersion.mockRejectedValue(
        new Error('Test error'),
      );

      await expect(
        service.upsertSecret(secretName, secretValue),
      ).rejects.toThrow('Test error');
    });
  });
  describe('deleteSecret', () => {
    it('should successfully delete a secret', async () => {
      const secretName = 'secretToDelete';

      const spy = jest
        .spyOn(mockSecretManagerServiceClient, 'deleteSecret')
        .mockResolvedValue(undefined);

      await service.deleteSecret(secretName);
      expect(spy).toHaveBeenCalledTimes(1);
    });
    it('should throw an error if deleteSecret fails', async () => {
      const secretName = 'erroneousSecret';
      mockSecretManagerServiceClient.deleteSecret.mockRejectedValue(
        new Error('Test error'),
      );
      await expect(service.deleteSecret(secretName)).rejects.toThrow(
        'Test error',
      );
    });
  });
});
