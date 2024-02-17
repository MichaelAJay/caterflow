import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Injectable } from '@nestjs/common';
import { CustomConfigService } from 'src/utility/services/custom-config.service';
import { ExternalSecretManager } from './interfaces/external-secret-manager.service.interface';

@Injectable()
export class GcpSecretManagerService implements ExternalSecretManager {
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
    try {
      const [version] = await this.client.accessSecretVersion({
        name: `${this.secretPrefix}/${secretName}/versions/latest`,
      });

      if (!version.payload?.data) {
        throw new Error(`Secret ${secretName} not found or has no data.`);
      }

      return version.payload.data.toString();
    } catch (err) {
      console.error(`Failed to access secret ${secretName}: ${err.message}`);
      throw err;
    }
  }

  async upsertSecret(secretName: string, secretValue: Buffer): Promise<void> {
    try {
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
          throw err;
        }
      }

      await this.client.addSecretVersion({
        parent: secretPath,
        payload: {
          data: secretValue,
        },
      });
    } catch (err) {
      console.error('err');
      throw err;
    }
  }

  async deleteSecret(secretName: string): Promise<void> {
    try {
      await this.client.deleteSecret({
        name: `${this.secretPrefix}/${secretName}`,
      });
    } catch (err) {
      console.error(`Failed to delete secret ${secretName}: ${err.message}`);
      throw err;
    }
  }
}
