import { Injectable } from '@nestjs/common';
import { GcpSecretManagerService } from '../../../external-modules/gcp-secret-manager/gcp-secret-manager.service';
import { ISecretManager } from './interfaces/secret-manager.service.interface';
import { CustomConfigService } from '../../../utility/services/custom-config.service';

@Injectable()
export class SecretManagerService implements ISecretManager {
  private readonly isLocal: boolean;

  constructor(
    private readonly cloudSecretManagerService: GcpSecretManagerService,
    private readonly customConfigService: CustomConfigService,
  ) {
    this.isLocal = this.customConfigService.getEnvVariable<boolean>('isLocal');
  }

  getSecretName(
    accountId: string,
    accountIntegrationId: string,
    secretType: string,
  ): string {
    return `${accountId}_${accountIntegrationId}_${secretType}`;
  }

  async getSecret(secretName: string): Promise<string> {
    if (!this.isLocal) {
      return this.cloudSecretManagerService.getSecret(secretName);
    }

    // Handle local secret retrieval (store in /internal/secrets)
    throw new Error('Not implemented');
  }

  async upsertSecret(secretName: string, secretValue: Buffer): Promise<void> {
    if (this.isLocal) {
      throw new Error('Upserting secrets locally not allowed');
    }
    return this.cloudSecretManagerService.upsertSecret(secretName, secretValue);
  }
}
