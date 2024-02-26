import { IExternalSecretManager } from 'src/external-modules/gcp-secret-manager/interfaces/external-secret-manager.service.interface';

export interface ISecretManager extends IExternalSecretManager {
  getSecretName(
    accountId: string,
    accountIntegrationId: string,
    secretType: string,
  ): string;
}
