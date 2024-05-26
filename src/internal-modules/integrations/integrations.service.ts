import { Injectable } from '@nestjs/common';
import { IBuildGetManyQueryInputArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { SystemIntegrationDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly systemIntegrationDbHandler: SystemIntegrationDbHandlerService,
  ) {}

  async getSystemIntegrations(
    query?: IBuildGetManyQueryInputArgs,
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

  async getExternalSystemById(externalSystemId: number, companyId?: string) {
    return this.systemIntegrationDbHandler.getExternalSystem(
      externalSystemId,
      companyId,
    );
  }
}
