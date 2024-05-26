import { Injectable } from '@nestjs/common';
import { GraphQLClient } from 'graphql-request';
import { CloudSecretManagerError } from 'src/common/errors/cloud_secret_manager.error';
import { SecretManagerService } from 'src/internal-modules/external-handlers/secret-manager/secret-manager.service';
import { CustomConfigService } from 'src/utility/services/custom-config/custom-config.service';
import { validateAllSubscribersQuery } from './validators/all-subscribers.ezcater-validator';
import { SubscriberResponse } from './types/ezcater-response/all-subscribers.response.type';
import { validateAllCaterersQuery } from './validators/all-caterers.ezcater-validator';
import { CatererResponse } from './types/ezcater-response/caterer.response.type';
import { validateGetOrderByIdQuery } from './validators/get-order-by-id.ezcater-validator';
import { EzCaterCompleteOrder } from './types/ezcater-response/get-order-by-id.response.type';
import { queries } from './gql/queries';
import { mutations } from './gql/mutations';

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

    this.getSubscribersQuery = queries.allSubscribers;
    this.createSubscriberMutation = mutations.createSubscriber;
    this.createSubscriptionMutation = mutations.createSubscription;
    this.getCaterersQuery = queries.allCaterers;
    this.getMenusQuery = queries.menusByCaterer;
    this.getOrderQuery = queries.getOrderById;
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
  async getSubscribers(
    companyId: string,
    companyAssetId: string,
  ): Promise<SubscriberResponse[]> {
    try {
      const client = await this.getClientWithAuth(companyId, companyAssetId);

      const response = client.request(this.getSubscribersQuery);

      // Now validate
      if (!validateAllSubscribersQuery(response)) {
        throw new Error('Invalid response');
      }

      return response.data.subscribers;
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

  async getCaterers(
    companyId: string,
    companyAssetId: string,
  ): Promise<CatererResponse[]> {
    try {
      const client = await this.getClientWithAuth(companyId, companyAssetId);
      const response = client.request(this.getCaterersQuery);

      // Validate
      if (!validateAllCaterersQuery(response)) {
        throw new Error('Validation error');
      }

      return response.data.caterers;
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

  async getOrder(
    companyId: string,
    companyAssetId: string,
    orderId: string,
  ): Promise<EzCaterCompleteOrder> {
    try {
      const client = await this.getClientWithAuth(companyId, companyAssetId);
      const response = client.request(this.getOrderQuery, { orderId });

      // Validate
      if (!validateGetOrderByIdQuery(response)) {
        throw new Error('validation error');
      }

      return response.data.order;
    } catch (err) {
      throw err;
    }
  }
}
