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
import { CompanyConnectionAsset } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/company_connection_assets';

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
    assets: CompanyConnectionAsset,
  ): Promise<GraphQLClient> {
    if (!assets.API_KEY) {
      throw new Error('oops i did it again');
    }
    const client = new GraphQLClient(this.ezCaterApiUrl, {
      headers: { Authorization: assets['API_KEY'].value },
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
    assets: CompanyConnectionAsset,
  ): Promise<SubscriberResponse[]> {
    try {
      const client = await this.getClientWithAuth(assets);

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

  async createSubscriber(companyId: string, assets: CompanyConnectionAsset) {
    const webhookUrl = `theurl/${companyId}`;
    try {
      const client = await this.getClientWithAuth(assets);
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
    assets: CompanyConnectionAsset,
    subscriberId: string,
    eventKey: 'accepted' | 'cancelled',
    catererId: string,
  ) {
    try {
      const client = await this.getClientWithAuth(assets);
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
    assets: CompanyConnectionAsset,
  ): Promise<CatererResponse[]> {
    try {
      const client = await this.getClientWithAuth(assets);
      const response = await client.request(this.getCaterersQuery);

      // Validate
      if (!validateAllCaterersQuery(response)) {
        throw new Error('Validation error');
      }

      return response.caterers;
    } catch (err) {
      throw err;
    }
  }

  async getMenus(
    companyId: string,
    assets: CompanyConnectionAsset,
    catererId: string,
  ) {
    try {
      const client = await this.getClientWithAuth(assets);
      const response = client.request(this.getMenusQuery, { catererId });

      // Validate
    } catch (err) {
      throw err;
    }
  }

  async getOrder(
    companyId: string,
    assets: CompanyConnectionAsset,
    orderId: string,
  ): Promise<EzCaterCompleteOrder> {
    try {
      const client = await this.getClientWithAuth(assets);
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
