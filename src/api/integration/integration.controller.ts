import { Controller, Get, Query, SetMetadata } from '@nestjs/common';
import { IIntegrationController } from './interfaces/integration.controller.interface';
import { $Enums } from '@prisma/client';
import { IntegrationsService } from '../../internal-modules/integrations/integrations.service';
import { IBuildRetrieveIntegrationListArgs } from '../../internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

@Controller('integration')
export class IntegrationController implements IIntegrationController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('list')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrations])
  async getIntegrations(
    @Query() query: IBuildRetrieveIntegrationListArgs,
  ): Promise<any> {
    return this.integrationsService.getSystemIntegrations(
      Object.keys(query).length > 0 ? query : undefined,
    );
  }
}
