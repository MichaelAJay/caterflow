import { Injectable } from '@nestjs/common';
import { IBuildRetrieveIntegrationListArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { SystemIntegrationDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { IntegrationsMapperService } from './integrations-mapper.service';
import { ResponseIntegrationTemplate } from './types/mapped/response-integration-template.type';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly systemIntegrationDbHandler: SystemIntegrationDbHandlerService,
    private readonly integrationsMapper: IntegrationsMapperService,
  ) {}

  async getSystemIntegrations(
    query?: IBuildRetrieveIntegrationListArgs,
  ): Promise<ResponseIntegrationTemplate[]> {
    const records = await this.systemIntegrationDbHandler.retrieveList(query);
    return this.integrationsMapper.mapIntegrationsWithRequirementsForResponse(
      records,
    );
  }
}
