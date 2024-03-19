import { IExternalSecretManager } from 'src/external-modules/gcp-secret-manager/interfaces/external-secret-manager.service.interface';

export interface ISecretManager extends IExternalSecretManager {
  getSecretName(
    companyId: string,
    companyIntegrationId: string,
    secretType: string,
  ): string;
  getSystemSecretName(secretName: string): string;
}
