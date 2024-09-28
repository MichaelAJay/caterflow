import { Injectable } from '@nestjs/common';
import { IBuildGetManyQueryInputArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { SystemIntegrationDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/system-integration-db-handler.service';
import { IntegrationsMapperService } from './integrations-mapper.service';
import { $Enums } from '@prisma/client';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly systemIntegrationDbHandler: SystemIntegrationDbHandlerService,
    private readonly integrationsMapper: IntegrationsMapperService,
  ) {}

  async getSystemIntegrations(query?: IBuildGetManyQueryInputArgs) {
    const records =
      await this.systemIntegrationDbHandler.getSystemIntegrations(query);

    return records;
  }

  async getExternalSystems(query?: any) {
    const records =
      await this.systemIntegrationDbHandler.getExternalSystems(query);

    return this.integrationsMapper.mapExternalSystemsForResponse(records);
  }

  async getExternalSystemById(
    externalSystemName: $Enums.ExternalSystemName,
    companyId?: string,
  ) {
    return this.systemIntegrationDbHandler.getExternalSystem(
      externalSystemName,
      companyId,
    );
  }
}
