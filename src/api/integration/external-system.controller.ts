import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { IntegrationsService } from '../../internal-modules/integrations/integrations.service';
import { $Enums } from '@prisma/client';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Controller('external-system')
export class ExternalSystemController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('list')
  async getExternalSystems(@Query() query: any) {
    return this.integrationsService.getExternalSystems(
      Object.keys(query).length > 0 ? query : undefined,
    );
  }

  /**
   * Notes:
   * This maybe shouldn't require metadata, or even company user
   * But, if company IS on req, it should be included
   *
   */
  @Get(':id')
  @SetMetadata('permissions', [$Enums.PermissionName.ManageIntegrations])
  async getExternalSystemById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) externalSystemId: number,
  ) {
    const { user } = req;
    const companyId = user.companyId || undefined;

    return this.integrationsService.getExternalSystemById(
      externalSystemId,
      companyId,
    );
  }
}
