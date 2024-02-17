import { ExternalSecretManager } from 'src/external-modules/gcp-secret-manager/interfaces/external-secret-manager.service.interface';

export interface SecretManager extends ExternalSecretManager {
  getSecretName(
    accountId: string,
    accountIntegrationId: string,
    secretType: string,
  ): string;
}
