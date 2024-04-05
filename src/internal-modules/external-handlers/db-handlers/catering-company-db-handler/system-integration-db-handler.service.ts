import { Injectable } from '@nestjs/common';
import { ISystemIntegrationDbHandler } from './interfaces/sytem-integration-db-handler.service.interface';
import { IBuildRetrieveIntegrationListArgs } from './interfaces/query-builder-args.interfaces';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { IntegrationTemplateWithRequirements } from './types/return/integration-template-with-requirements.type';

@Injectable()
export class SystemIntegrationDbHandlerService
  implements ISystemIntegrationDbHandler
{
  constructor(
    private readonly prismaClient: PrismaClientService,
    private readonly systemIntegrationDbQueryBuilder: SystemIntegrationDbQueryBuilderService,
  ) {}

  async retrieveList(
    query?: IBuildRetrieveIntegrationListArgs,
  ): Promise<IntegrationTemplateWithRequirements[]> {
    const records: IntegrationTemplateWithRequirements[] =
      await this.prismaClient.integrationTemplate.findMany({
        ...this.systemIntegrationDbQueryBuilder.buildRetrieveIntegrationsListQueryWithoutInclude(
          query,
        ),
        include: {
          requirements: true,
        },
      });
    return records;
  }
}
