import { ISecretManager } from 'src/internal-modules/external-handlers/secret-manager/interfaces/secret-manager.service.interface';

export const mockSecretManagerService: ISecretManager = {
  getSecretName: jest.fn(),
  getSecret: jest.fn(),
  upsertSecret: jest.fn(),
};
