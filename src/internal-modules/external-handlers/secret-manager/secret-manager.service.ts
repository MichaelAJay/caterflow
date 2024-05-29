import { Injectable } from '@nestjs/common';
import { GcpSecretManagerService } from '../../../external-modules/gcp-secret-manager/gcp-secret-manager.service';
import { ISecretManager } from './interfaces/secret-manager.service.interface';
import { CustomConfigService } from '../../../utility/services/custom-config/custom-config.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class SecretManagerService implements ISecretManager {
  private readonly isLocal: boolean;
  private readonly env: 'development' | 'production';

  constructor(
    private readonly cloudSecretManagerService: GcpSecretManagerService,
    private readonly customConfigService: CustomConfigService,
  ) {
    this.isLocal = this.customConfigService.getEnvVariable<boolean>('isLocal');
    this.env = this.customConfigService.getEnvVariable<
      'development' | 'production'
    >('env');
  }

  getSecretName(companyId: string, companyIntegrationAssetId: string): string {
    return `${companyId}_${companyIntegrationAssetId}`;
  }

  getSystemSecretName(secretName: string): string {
    return `CATERFLOW_${this.env === 'development' ? 'DEV' : 'PROD'}_${secretName}`;
  }

  async getSecret(secretName: string, getFromLocal = true): Promise<string> {
    let secret;
    // Some local secrets are supposed to be stored on the cloud
    if (this.isLocal && getFromLocal) {
      const secretPath = this.customConfigService.getEnvVariable<string>(
        `localPathToSecret[${secretName}]`,
      );
      secret = await fs.readFile(
        path.resolve(__dirname, '../../../..', secretPath),
        'utf-8',
      );
    } else {
      secret = await this.cloudSecretManagerService.getSecret(secretName);
    }
    return secret;
  }

  async upsertSecret(secretName: string, secretValue: Buffer): Promise<void> {
    const result = await this.cloudSecretManagerService.upsertSecret(
      secretName,
      secretValue,
    );
    return result;
    // if (!this.isLocal) {
    // }
    // throw new Error('Upserting secrets locally not allowed');
  }
}
