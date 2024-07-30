import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ICateringCompanyDbHandler } from './interfaces/catering-company-db-handler.service.interface';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { $Enums, CateringCompany, Prisma } from '@prisma/client';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import { ERROR_CODE } from '../../../../common/codes/error-codes';
import { validateExternalSystem } from './validators/external-systems.validator';
import { CompanyConnectionAsset } from './types/company_connection_assets';
import {
  RequirementType,
  validateRequirementType,
} from './types/external_systems_requirements';
import { validateCompanyExternalSystemConnectionAssets } from './validators/company_external_connection_assets.validator';
import companyIntegrationAndConnectionUtilities from 'src/internal-modules/catering-company/utility/company-integration-and-connection.utilities';

@Injectable()
export class CateringCompanyDbHandlerService
  implements ICateringCompanyDbHandler
{
  async updateExternalySystemConnection(
    connectionId: string,
    updates: Pick<
      Prisma.CompanyExternalSystemConnectionUncheckedUpdateInput,
      'isFullyConfigured' | 'isTested' | 'assets'
    >,
    // include?: Prisma.CompanyExternalSystemConnectionInclude,
  ) {
    await this.prismaClient.companyExternalSystemConnection.update({
      where: { id: connectionId },
      data: updates,
    });
  }

  async getAllCompanyIntegrationsByConnectionId(connectionId: string) {
    await this.prismaClient.companyIntegration.findMany({
      where: {
        OR: [
          { srcConnectionId: connectionId },
          { targetConnectionId: connectionId },
        ],
      },
    });

    // Include the connections
    // For each company integration
    // If ci.source is fully configured AND ci.target is fully configured, update company integration
    // Or provide a general status update
  }

  constructor(
    private readonly cateringCompanyDbQueryBuilder: CateringCompanyDbQueryBuilderService,
    private readonly systemIntegrationDbQueryBuilder: SystemIntegrationDbQueryBuilderService,
    private readonly prismaClient: PrismaClientService,
  ) {}

  /**
   * Called once per company on creation
   * Initializes peripheral records for company, included:
   * - User
   */
  async createCateringCompany(
    name: string,
    ownerId: string,
  ): Promise<CateringCompany> {
    if (!uuidUtils.isUUID(ownerId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    // Take care of known errors here
    const company = await this.prismaClient.cateringCompany.create({
      data: { name, ownerId, users: { connect: { id: ownerId } } },
    });
    return company;
  }

  /**
   * Integrations and Connections
   */
  async getIntegrationTemplateWithCompanyIntegration(
    templateId: number,
    companyId: string,
  ) {
    const integrationTemplate =
      await this.prismaClient.integrationTemplate.findUniqueOrThrow({
        where: { id: templateId },
        include: {
          integrations: {
            where: { companyId },
            select: { companyId: true },
          },
        },
      });
    return integrationTemplate;
  }

  async getIntegrations() {}

  async getConnections(companyId: string, query?: any) {
    if (!uuidUtils.isUUID(companyId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    // Should at least sort, limit, and skip

    const records =
      await this.prismaClient.companyExternalSystemConnection.findMany({
        where: { companyId },
      });
    return records;
  }

  async getConnectionsByExternalSystemId(
    companyId: string,
    externalSystemIds: number[],
  ) {
    const records =
      await this.prismaClient.companyExternalSystemConnection.findMany({
        where: { companyId, systemId: { in: externalSystemIds } },
      });
    return records;
  }

  async getConnection(
    connectionId: string,
    include: Prisma.CompanyExternalSystemConnectionInclude = {
      srcFor: true, // CompanyIntegration[]
      targetFor: true, // CompanyIntegration[]
    },
  ) {
    if (!uuidUtils.isUUID(connectionId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    const record =
      await this.prismaClient.companyExternalSystemConnection.findUniqueOrThrow(
        {
          where: { id: connectionId },
          include,
        },
      );

    return record;
  }

  async getConnectionWithValidatedAssets(connectionId: string) {
    if (!uuidUtils.isUUID(connectionId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    // may be able to whittle down on the select
    const { assets, ...connection } =
      await this.prismaClient.companyExternalSystemConnection.findUniqueOrThrow(
        {
          where: { id: connectionId },
        },
      );

    if (!validateCompanyExternalSystemConnectionAssets(assets)) {
      // log
      throw new InternalServerErrorException('Bad data');
    }
    console.log(assets);

    return { connection, assets };
  }

  async getAllConfiguredAndTestedIntegrationByConnectionId(
    connectionId: string,
  ) {
    if (!uuidUtils.isUUID(connectionId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    const records = await this.prismaClient.companyIntegration.findMany({
      where: {
        OR: [
          {
            srcConnectionId: connectionId,
            srcConnection: { isFullyConfigured: true, isTested: true },
          },
          {
            targetConnectionId: connectionId,
            targetConnection: { isFullyConfigured: true, isTested: true },
          },
        ],
      },
    });
    return records;
  }

  async createIntegration(
    companyId: string,
    templateId: number,
    uiName: string,
    srcConnectionId: string,
    targetConnectionId: string,
    event: $Enums.IntegrationEvent,
    creatorId: string,
    isConfigured = false,
  ) {
    if (!(uuidUtils.isUUID(companyId) && uuidUtils.isUUID(creatorId))) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    try {
      await this.prismaClient.companyIntegration.create({
        data: {
          companyId,
          templateId,
          uiName,
          srcConnectionId,
          targetConnectionId,
          event,
          creatorId,
          isConfigured,
        },
      });
    } catch (err) {
      // check for unique constraint violation
      throw err;
    }
  }

  async updateIntegrations(
    integrationIds: string[],
    updates: Pick<
      Prisma.CompanyIntegrationUncheckedUpdateManyInput,
      'srcConnectionId' | 'targetConnectionId' | 'isConfigured' | 'isActive'
    >,
  ) {
    await this.prismaClient.companyIntegration.updateMany({
      where: { id: { in: integrationIds } },
      data: updates,
    });
  }

  /**
   * Create a CompanyExternalSystemConnection record and update all CompanyIntegrations which should rely on it
   * @param companyId
   * @param systemId
   * @returns Object with srcFor and targetFor, company integration records for which the created connection is applied
   *
   * Could throw b/c system not found
   * Could throw b/c unique constraint violation
   */
  async createExternalSystemConnection(
    companyId: string,
    systemId: number,
    uiName: string,
    assets: CompanyConnectionAsset,
  ) {
    try {
      if (!uuidUtils.isUUID(companyId)) {
        throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
      }

      const record =
        await this.prismaClient.companyExternalSystemConnection.create({
          data: {
            companyId,
            systemId,
            systemUIName: uiName,
            isFullyConfigured: Object.keys(assets).length == 0,
            assets,
          },
        });
      return record;
    } catch (err) {
      // May throw unique constraint error (companyId, systemId)
      throw err;
    }
  }

  /**
   *
   * @param companyId
   * @param systemName
   * @returns
   */
  async getAssets(companyId: string, systemName: $Enums.ExternalSystemName) {
    const { assets } =
      await this.prismaClient.companyExternalSystemConnection.findFirstOrThrow({
        where: {
          companyId,
        },
        select: { assets: true },
      });
    return assets;
  }

  // Append companyId (ONE) to each caterer record and create many CompanyCaterer records
  async createCaterers(
    companyId: string,
    caterers: Pick<
      Prisma.CompanyCatererCreateManyInput,
      'name' | 'ezCaterId' | 'storeNumber'
    >[],
  ) {
    await this.prismaClient.companyCaterer.createMany({
      data: caterers.map((caterer) => ({ ...caterer, companyId })),
    });
  }
}
