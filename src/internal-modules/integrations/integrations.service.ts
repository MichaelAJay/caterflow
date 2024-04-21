import { Injectable } from '@nestjs/common';
import { IBuildRetrieveIntegrationListArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { SystemIntegrationDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly systemIntegrationDbHandler: SystemIntegrationDbHandlerService,
  ) {}

  async getSystemIntegrations(
    query?: IBuildRetrieveIntegrationListArgs,
  ): Promise<any[]> {
    const records =
      await this.systemIntegrationDbHandler.getSystemIntegrations(query);

    /**
     * @TODO map
     *
     */

    return records;
  }

  async getExternalSystems(query?: any) {
    const records =
      await this.systemIntegrationDbHandler.getExternalSystems(query);

    /**
     * @TODO map
     */
    return records;
  }
}
