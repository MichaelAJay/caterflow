import { Injectable } from '@nestjs/common';
import { ISystemIntegrationDbHandler } from './interfaces/sytem-integration-db-handler.service.interface';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';

@Injectable()
export class SystemIntegrationDbHandlerService
  implements ISystemIntegrationDbHandler
{
  constructor(
    private readonly prismaClient: PrismaClientService,
    private readonly systemIntegrationDbQueryBuilder: SystemIntegrationDbQueryBuilderService,
  ) {}

  async getSystemIntegrations(query?: any) {
    /**
     * @TODO query stuff
     */

    const records = await this.prismaClient.integrationTemplate.findMany({
      include: {
        srcSystem: {
          include: { connectionRequirements: true },
        },
        targetSystem: {
          include: { connectionRequirements: true },
        },
        requirements: true,
      },
    });
    return records;
  }

  async getExternalSystems(query?: any) {
    /**
     * @TODO query stuff
     */
    const records = await this.prismaClient.externalSystem.findMany({
      include: {
        srcFor: true,
        targetFor: true,
        connectionRequirements: true,
      },
    });
    return records;
  }
}
