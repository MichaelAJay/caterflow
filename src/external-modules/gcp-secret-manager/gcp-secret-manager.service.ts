import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Injectable } from '@nestjs/common';
import { CustomConfigService } from '../../utility/services/custom-config.service';
import { IExternalSecretManager } from './interfaces/external-secret-manager.service.interface';
import * as Sentry from '@sentry/node';

@Injectable()
export class GcpSecretManagerService implements IExternalSecretManager {
  private client: SecretManagerServiceClient;
  private secretPrefix: string;
  private env: string;
  private product: string;

  constructor(private customConfigService: CustomConfigService) {
    this.client = new SecretManagerServiceClient();
    const projectId =
      this.customConfigService.getEnvVariable<string>('googleProjectId');
    this.secretPrefix = `projects/${projectId}/secrets`;
    this.env = this.customConfigService.getEnvVariable<string>('env');
    this.product = this.customConfigService.getEnvVariable<string>('product');
  }

  async getSecret(secretName: string): Promise<string> {
    const [version] = await this.client
      .accessSecretVersion({
        name: `${this.secretPrefix}/${secretName}/versions/latest`,
      })
      .catch((reason) => {
        Sentry.captureException(reason);
        throw reason;
      });

    if (!version.payload?.data) {
      throw new Error(`Secret ${secretName} not found or has no data.`);
    }

    return version.payload.data.toString();
  }

  async upsertSecret(secretName: string, secretValue: Buffer): Promise<void> {
    const secretPath = `${this.secretPrefix}/${secretName}`;
    try {
      await this.client.getSecret({ name: secretPath });
    } catch (err) {
      if (err.code === 5) {
        await this.client.createSecret({
          parent: this.secretPrefix,
          secretId: secretName,
          secret: {
            replication: {
              automatic: {},
            },
            labels: {
              product: this.product,
              env: this.env,
            },
          },
        });
      } else {
        Sentry.captureException(err);
        throw err;
      }
    }

    await this.client
      .addSecretVersion({
        parent: secretPath,
        payload: {
          data: secretValue,
        },
      })
      .catch((reason) => {
        Sentry.captureException(reason);
        throw reason;
      });
  }

  async deleteSecret(secretName: string): Promise<void> {
    await this.client
      .deleteSecret({
        name: `${this.secretPrefix}/${secretName}`,
      })
      .catch((reason) => {
        Sentry.captureException(reason);
        throw reason;
      });
  }
}
