import { Controller, Get, Query } from '@nestjs/common';
import { IntegrationsService } from '../../internal-modules/integrations/integrations.service';

@Controller('external-system')
export class ExternalSystemController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('list')
  async getExternalSystems(@Query() query: any) {
    return this.integrationsService.getExternalSystems(
      Object.keys(query).length > 0 ? query : undefined,
    );
  }
}
