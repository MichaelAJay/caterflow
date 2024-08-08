import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ISystemIntegrationDbHandler } from './interfaces/sytem-integration-db-handler.service.interface';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { IBuildGetManyQueryInputArgs } from './interfaces/query-builder-args.interfaces';
import {
  ExternalSystemWithTypeRequirementsAndIntegrationsAndCompanyReference,
  ExternalSystemWithTypedRequirementsAndIntegrations,
} from './types/return/external-system.type';
import {
  validateFullExternalSystem,
  validateExternalSystems,
} from './validators/external-systems.validator';
import { validateExternalSystemRequirements } from './validators/external_system_requirements.validator';

@Injectable()
export class SystemIntegrationDbHandlerService
  implements ISystemIntegrationDbHandler
{
  constructor(
    private readonly prismaClient: PrismaClientService,
    private readonly systemIntegrationDbQueryBuilder: SystemIntegrationDbQueryBuilderService,
  ) {}

  async getIntegrationTemplate(templateId: number) {
    const { srcSystem, targetSystem, ...integrationTemplate } =
      await this.prismaClient.integrationTemplate.findUniqueOrThrow({
        where: { id: templateId },
        include: {
          srcSystem: { select: { uiName: true, requirements: true } },
          targetSystem: { select: { uiName: true, requirements: true } },
          requirements: true,
        },
      });

    // Need to validate system requirements
    const { requirements: srcSystemRequirements, ...srcSystemRemainder } =
      srcSystem;

    const { requirements: targetSystemRequirements, ...targetSystemRemainder } =
      targetSystem;

    if (
      !(
        validateExternalSystemRequirements(srcSystemRequirements) &&
        validateExternalSystemRequirements(targetSystemRequirements)
      )
    ) {
      // Log
      throw new Error('Stuff messed up');
    }

    // Note: requirements are now validated
    return {
      ...integrationTemplate,
      srcSystem: {
        ...srcSystemRemainder,
        requirements: srcSystemRequirements,
      },
      targetSystem: {
        ...targetSystemRemainder,
        requirements: targetSystemRequirements,
      },
    };
  }

  async getSystemIntegrations(queryInput?: IBuildGetManyQueryInputArgs) {
    const records = await this.prismaClient.integrationTemplate.findMany({
      ...this.systemIntegrationDbQueryBuilder.buildFindManyQuery(queryInput),
      include: {
        srcSystem: true,
        targetSystem: true,
        requirements: true,
      },
    });
    return records;
  }

  async getExternalSystems(
    queryInput?: IBuildGetManyQueryInputArgs,
  ): Promise<ExternalSystemWithTypedRequirementsAndIntegrations[]> {
    const records = await this.prismaClient.externalSystem.findMany({
      ...this.systemIntegrationDbQueryBuilder.buildFindManyQuery(queryInput),
      include: {
        // These represent minor improvements on performance, but greatly conflate typings
        // srcFor: { select: { uiName: true, uiDescription: true } },
        // targetFor: { select: { uiName: true, uiDescription: true } },
        srcFor: true,
        targetFor: true,
      },
    });

    if (!validateExternalSystems(records)) {
      // log
      throw new Error('Validation error');
    }

    return records;
  }

  async getExternalSystem(
    externalSystemId: number,
    companyId?: string,
  ): Promise<ExternalSystemWithTypeRequirementsAndIntegrationsAndCompanyReference> {
    const record = await this.prismaClient.externalSystem.findUniqueOrThrow({
      where: {
        id: externalSystemId,
      },
      include: {
        companyConnections: {
          where: { companyId },
          select: { id: true },
        },
        srcFor: true,
        targetFor: true,
      },
    });

    const { companyConnections, ...baseRecord } = record;
    if (!validateFullExternalSystem(baseRecord)) {
      // log
      throw new InternalServerErrorException(
        'Unexpected record validation error. Our team is aware of the problem.',
      );
    }
    console.log(baseRecord.requirements);

    return {
      ...baseRecord,
      connectionId:
        companyConnections.length > 0 ? companyConnections[0].id : undefined,
    };
  }
}
