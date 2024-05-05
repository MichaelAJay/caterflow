import { Injectable } from '@nestjs/common';
import { ISystemIntegrationDbHandler } from './interfaces/sytem-integration-db-handler.service.interface';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { IBuildGetManyQueryInputArgs } from './interfaces/query-builder-args.interfaces';

@Injectable()
export class SystemIntegrationDbHandlerService
  implements ISystemIntegrationDbHandler
{
  constructor(
    private readonly prismaClient: PrismaClientService,
    private readonly systemIntegrationDbQueryBuilder: SystemIntegrationDbQueryBuilderService,
  ) {}

  async getSystemIntegrations(queryInput?: IBuildGetManyQueryInputArgs) {
    const records = await this.prismaClient.integrationTemplate.findMany({
      ...this.systemIntegrationDbQueryBuilder.buildFindManyQuery(queryInput),
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

  async getExternalSystems(queryInput?: IBuildGetManyQueryInputArgs) {
    const records = await this.prismaClient.externalSystem.findMany({
      ...this.systemIntegrationDbQueryBuilder.buildFindManyQuery(queryInput),
      include: {
        srcFor: true,
        targetFor: true,
        connectionRequirements: true,
      },
    });
    return records;
  }

  async getExternalSystemRequirement(requirementId: number) {
    const record =
      await this.prismaClient.externalSystemConnectionRequirement.findUniqueOrThrow(
        {
          where: { id: requirementId },
        },
      );

    return record;
  }
}
