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
import { validateRequirementType } from './types/external_systems_requirements';

@Injectable()
export class CateringCompanyDbHandlerService
  implements ICateringCompanyDbHandler
{
  async updateExternalySystemConnection(
    connectionId: string,
    updates: Pick<
      Prisma.CompanyExternalSystemConnectionUncheckedUpdateInput,
      'isFullyConfigured' | 'isTested'
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
      await this.prismaClient.companyExternalSystemConnection.findUnique({
        where: { id: connectionId },
        include,
      });

    return record;
  }

  async createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ) {
    if (!(uuidUtils.isUUID(companyId) && uuidUtils.isUUID(creatorId))) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    // Huge refactor - rewrite
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
  ): Promise<any> {
    try {
      if (!uuidUtils.isUUID(companyId)) {
        throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
      }

      const externalSystem =
        await this.prismaClient.externalSystem.findUniqueOrThrow({
          where: { id: systemId },
        });

      if (!validateExternalSystem(externalSystem)) {
        console.error(validateExternalSystem.errors);
        throw new InternalServerErrorException(
          // log
          "Unexpected validation error. We've been alerted to the issue.",
        );
      }

      const assets: CompanyConnectionAsset = {};
      for (const requirement in externalSystem.requirements) {
        // Ensure key is from the RequirementType string literal
        if (!validateRequirementType(requirement)) {
          // Should log
          // Maybe should throw too
          continue;
        }

        const assetSeed = externalSystem.requirements[requirement];

        if (!assetSeed) {
          // should log
          continue;
        }

        assets[requirement] = {
          ...assetSeed,
          status: 'UNCONFIGURED',
        };
      }

      const record =
        await this.prismaClient.companyExternalSystemConnection.create({
          data: {
            companyId,
            systemId,
            systemUIName: externalSystem.uiName,
            isFullyConfigured: Object.keys(assets).length == 0,
            assets,
          },
        });
      return record;
    } catch (err) {
      // May throw on external system findUniqueOrThrow
      // May throw validation error
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
    const asset =
      await this.prismaClient.companyExternalSystemConnection.findFirst({
        where: {
          companyId,
        },
        select: { assets: true },
      });
    return asset;
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
