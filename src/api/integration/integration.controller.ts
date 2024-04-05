import { Controller, Get, SetMetadata } from '@nestjs/common';
import { IIntegrationController } from './interfaces/integration.controller.interface';
import { $Enums } from '@prisma/client';
import { IntegrationsService } from '../../internal-modules/integrations/integrations.service';

@Controller('integration')
export class IntegrationController implements IIntegrationController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('list')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrations])
  async getIntegrations(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
