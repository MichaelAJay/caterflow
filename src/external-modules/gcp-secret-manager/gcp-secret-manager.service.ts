import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CustomConfigService } from '../../utility/services/custom-config/custom-config.service';
import { IExternalSecretManager } from './interfaces/external-secret-manager.service.interface';
import * as Sentry from '@sentry/node';
import { CloudSecretManagerError } from 'src/common/errors/cloud_secret_manager.error';

@Injectable()
export class GcpSecretManagerService implements IExternalSecretManager {
  private client: SecretManagerServiceClient;
  private projectPrefix: string;
  private secretPrefix: string;
  private env: string;
  private product: string;

  constructor(private customConfigService: CustomConfigService) {
    this.client = new SecretManagerServiceClient();
    const projectId =
      this.customConfigService.getEnvVariable<string>('googleProjectId');
    this.projectPrefix = `projects/${projectId}`;
    this.secretPrefix = `${this.projectPrefix}/secrets`;
    this.env = this.customConfigService.getEnvVariable<string>('env');
    this.product = this.customConfigService.getEnvVariable<string>('product');
  }

  async getSecret(secretName: string): Promise<string> {
    const [version] = await this.client
      .accessSecretVersion({
        name: `${this.secretPrefix}/${secretName}/versions/latest`,
      })
      .catch((reason) => {
        /**
         * @TODO log instead of Sentry
         */
        Sentry.captureException(reason);
        throw reason;
      });

    if (!version.payload?.data) {
      // throw new Error(`Secret ${secretName} not found or has no data.`);
      throw new CloudSecretManagerError(secretName);
    }

    return version.payload.data.toString();
  }

  async upsertSecret(secretName: string, secretValue: Buffer): Promise<void> {
    const secretPath = `${this.secretPrefix}/${secretName}`;
    try {
      await this.client.getSecret({ name: secretPath });
    } catch (err) {
      // For some reason, I thought the error code was 5 - but I'm getting "PERMISSION DENIED", and an added message of "(or it may not exist)"
      if (err.code === 5 || err.code === 7) {
        await this.client
          .createSecret({
            parent: this.projectPrefix,
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
          })
          .catch((reason) => {
            console.error(reason);
            // secretmanager.secrets.create denied for resource 'projects/ezman-386111'
            throw reason;
          });
      } else {
        // This should be logging instead
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
