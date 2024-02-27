import { Injectable } from '@nestjs/common';
import { GcpSecretManagerService } from '../../../external-modules/gcp-secret-manager/gcp-secret-manager.service';
import { ISecretManager } from './interfaces/secret-manager.service.interface';
import { CustomConfigService } from '../../../utility/services/custom-config.service';
import * as fs from 'fs/promises';
import * as path from 'path';

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
    let secret;
    if (this.isLocal) {
      const secretPath = `PATH_TO_${secretName}`;
      secret = await fs.readFile(
        path.resolve(__dirname, '../../..', secretPath),
        'utf-8',
      );
      console.log('secret', secret);
    } else {
      secret = await this.cloudSecretManagerService.getSecret(secretName);
    }
    return secret;

    // Handle local secret retrieval (store in /internal/secrets)
    throw new Error('Not implemented');
  }

  async upsertSecret(secretName: string, secretValue: Buffer): Promise<void> {
    if (!this.isLocal) {
      return this.cloudSecretManagerService.upsertSecret(
        secretName,
        secretValue,
      );
    }
    throw new Error('Upserting secrets locally not allowed');
  }
}
