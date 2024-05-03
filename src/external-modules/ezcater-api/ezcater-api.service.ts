import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { GraphQLClient } from 'graphql-request';
import { join } from 'path';
import { CloudSecretManagerError } from 'src/common/errors/cloud_secret_manager.error';
import { SecretManagerService } from 'src/internal-modules/external-handlers/secret-manager/secret-manager.service';
import { CustomConfigService } from 'src/utility/services/custom-config/custom-config.service';

@Injectable()
export class EzCaterApiService {
  private readonly ezCaterApiUrl: string;
  private readonly getSubscribersQuery: string;
  private readonly createSubscriberMutation: string;
  private readonly createSubscriptionMutation: string;
  private readonly getCaterersQuery: string;
  private readonly getMenusQuery: string;
  private readonly getOrderQuery: string;

  constructor(
    private readonly secretManager: SecretManagerService,
    private readonly customConfigService: CustomConfigService,
  ) {
    this.ezCaterApiUrl =
      // Will throw if undefined
      this.customConfigService.getEnvVariable<string>('ezCaterApiUrl');

    const gqlBasePath = join(__dirname, './gql');

    // Read queries into class properties
    this.getSubscribersQuery = getQueryStringFromFile('all-subscribers.gql');
    this.createSubscriberMutation = getQueryStringFromFile(
      'create-subscriber.gql',
    );
    this.createSubscriptionMutation = getQueryStringFromFile(
      'create-subscription.gql',
    );
    this.getCaterersQuery = getQueryStringFromFile('all-caterers.gql');
    this.getMenusQuery = getQueryStringFromFile('menus-by-caterer.gql');
    this.getOrderQuery = getQueryStringFromFile('get-order-by-id.gql');

    function getQueryStringFromFile(fileName: string): string {
      return readFileSync(join(gqlBasePath, fileName), 'utf8');
    }
  }

  private async getClientWithAuth(
    companyId: string,
    companyAssetId: string,
  ): Promise<GraphQLClient> {
    const secretName = this.secretManager.getSecretName(
      companyId,
      companyAssetId,
    );

    // Throws CloudSecretManagerError if secret not found
    // Should be handled in whatever calls getClientWithAuth
    const authToken = await this.secretManager.getSecret(secretName);
    const client = new GraphQLClient(this.ezCaterApiUrl, {
      headers: { Authorization: authToken },
    });
    return client;
  }

  /**
   *
   * @param companyId
   * @param companyAssetId - CompanyExternalSystemConnectionAsset.id
   */
  async getSubscribers(companyId: string, companyAssetId: string) {
    try {
      const client = await this.getClientWithAuth(companyId, companyAssetId);

      const response = client.request(this.getSubscribersQuery);

      // Now validate
    } catch (err) {
      if (err instanceof CloudSecretManagerError) {
        // do something special
      }
      throw err;
    }
  }

  async createSubscriber(
    companyId: string,
    companyAssetId: string,
    webhookUrl: string,
  ) {
    try {
      const client = await this.getClientWithAuth(companyId, companyAssetId);
      const response = client.request(this.createSubscriberMutation, {
        webhookUrl,
      });

      // Validate
    } catch (err) {
      throw err;
    }
  }

  async createSubscription(
    companyId: string,
    companyAssetId: string,
    subscriberId: string,
    eventKey: 'accepted' | 'cancelled',
    catererId: string,
  ) {
    try {
      const client = await this.getClientWithAuth(companyId, companyAssetId);
      const response = client.request(this.createSubscriptionMutation, {
        subscriberId,
        eventKey,
        catererId,
      });

      // Validate
    } catch (err) {
      throw err;
    }
  }

  async getCaterers(companyId: string, companyAssetId: string) {
    try {
      const client = await this.getClientWithAuth(companyId, companyAssetId);
      const response = client.request(this.getCaterersQuery);

      // Validate
    } catch (err) {
      throw err;
    }
  }

  async getMenus(companyId: string, companyAssetId: string, catererId: string) {
    try {
      const client = await this.getClientWithAuth(companyId, companyAssetId);
      const response = client.request(this.getMenusQuery, { catererId });

      // Validate
    } catch (err) {
      throw err;
    }
  }

  async getOrder(companyId: string, companyAssetId: string, orderId: string) {
    try {
      const client = await this.getClientWithAuth(companyId, companyAssetId);
      const response = client.request(this.getOrderQuery, { orderId });

      // Validate
    } catch (err) {
      throw err;
    }
  }
}
