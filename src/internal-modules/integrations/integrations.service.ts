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
    return [];
  }
}
