import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Injectable } from '@nestjs/common';
import { SecretManager } from 'src/internal-modules/external-handlers/secret-manager/interfaces/secret-manager.service.interface';
import { CustomConfigService } from 'src/utility/services/custom-config.service';

@Injectable()
export class GcpSecretManagerService implements SecretManager {
  private client: SecretManagerServiceClient;
  private secretPrefix: string;

  constructor(private customConfigService: CustomConfigService) {
    this.client = new SecretManagerServiceClient();
    const projectId =
      this.customConfigService.getEnvVariable<string>('GOOGLE_PROJECT_ID');
    this.secretPrefix = `projects/${projectId}/secrets`;
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
}
