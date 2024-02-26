import { IExternalSecretManager } from 'src/external-modules/gcp-secret-manager/interfaces/external-secret-manager.service.interface';

export const mockGcpSecretManagerService: IExternalSecretManager = {
  getSecret: jest.fn(),
  upsertSecret: jest.fn(),
};
