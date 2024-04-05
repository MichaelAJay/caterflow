import { Controller, Get, SetMetadata } from '@nestjs/common';
import { IIntegrationController } from './interfaces/integration.controller.interface';
import { $Enums } from '@prisma/client';

@Controller('integration')
export class IntegrationController implements IIntegrationController {
  @Get('list')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrations])
  async getIntegrations(): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
