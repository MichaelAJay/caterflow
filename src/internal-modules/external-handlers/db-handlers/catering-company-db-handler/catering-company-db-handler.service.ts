import { ConflictException, Injectable } from '@nestjs/common';
import { ICateringCompanyDbHandler } from './interfaces/catering-company-db-handler.service.interface';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import {
  $Enums,
  CateringCompany,
  CompanyIntegration,
  Prisma,
} from '@prisma/client';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import { ERROR_CODE } from '../../../../common/codes/error-codes';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { KNOWN_PRISMA_ERROR_MAP } from 'src/external-modules/prisma-client/resources/known-prisma-error-map';

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
      connectionAssets: true,
      srcFor: true, // CompanyIntegration[]
      targetFor: true, // CompanyIntegration[]
      externalSystem: {
        include: {
          connectionRequirements: true,
        },
      },
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

    const template =
      await this.prismaClient.integrationTemplate.findUniqueOrThrow({
        where: { id: templateId },
        include: {
          // ExternalSystem
          srcSystem: {
            include: {
              // CompanyConnections[] - max length should be 1
              companyConnections: {
                where: { companyId },
              },
            },
          },
          // ExternalSystem
          targetSystem: {
            include: {
              // CompanyConnections[] - max length should be 1
              companyConnections: {
                where: { companyId },
              },
            },
          },
        },
      });

    const { srcSystem, targetSystem } = template;
    // Confirm uniqueness of srcSystem/targetSystem companyConnections - there should only be one per company
    if (
      srcSystem.companyConnections.length > 1 ||
      targetSystem.companyConnections.length > 1
    ) {
      // Log and throw
      throw new Error('Uniqueness constraint has been validated');
    }

    const input: Prisma.CompanyIntegrationUncheckedCreateInput = {
      companyId,
      templateId,
      uiName: template.uiName,
      event: template.event,
      creatorId,
    };

    // If the srcSystem is referenced by a CompanyExternalSystemConnection record with matching companyId, add that connection
    if (srcSystem.companyConnections.length === 1) {
      input.srcConnectionId = srcSystem.companyConnections[0].id;
    }

    // If the targetSystem is referenced by a CompanyExternalSystemConnection record with matching companyId, add that connection
    if (targetSystem.companyConnections.length === 1) {
      input.targetConnectionId = targetSystem.companyConnections[0].id;
    }

    await this.prismaClient.companyIntegration.create({
      data: input,
    });
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
   * This would be the most performant method - but may be overkill, and also doesn't provide which company integrations may be updated
   */
  async createConnectionRaw(companyId: string, systemId: number) {
    // Retrieve simple external system
    const { uiName: systemUIName } =
      await this.prismaClient.externalSystem.findUniqueOrThrow({
        where: { id: systemId },
        select: { uiName: true },
      });

    // Create simple connection
    const { id: connectionId } =
      await this.prismaClient.companyExternalSystemConnection.create({
        data: {
          companyId,
          systemId,
          systemUIName,
        },
        select: { id: true },
      });

    // Complex CompanyIntegration updates
    const [
      numSrcUpdatedCompanyIntegrations,
      numTargetUpdatedCompanyIntegrations,
    ] = await Promise.all([
      this.prismaClient.$executeRawUnsafe(
        `
        UPDATE "company_integrations" ci
        SET "src_connection_id" = ${connectionId}
        FROM "integration_templates" it
        WHERE ci."template_id" = it.id AND "src_system_id" = ${systemId}
      `,
      ),
      this.prismaClient.$executeRawUnsafe(
        `
        UPDATE "company_integrations" ci
        SET "target_connection_id" = ${connectionId}
        FROM "integration_templates" it
        WHERE ci."template_id" = it.id AND "target_system_id" = ${systemId}
        `,
      ),
    ]);
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
    if (!uuidUtils.isUUID(companyId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    const systemWithIntegrations =
      await this.prismaClient.externalSystem.findUniqueOrThrow({
        where: { id: systemId },
        include: {
          connectionRequirements: {
            select: { id: true },
          },
        },
      });

    try {
      // Create record and connect
      const record =
        await this.prismaClient.companyExternalSystemConnection.create({
          data: {
            companyId,
            systemId,
            systemUIName: systemWithIntegrations.uiName,
            isFullyConfigured:
              systemWithIntegrations.connectionRequirements.length === 0,
            isTested:
              systemWithIntegrations.connectionRequirements.length === 0,
          },
        });

      // Could throw unique error

      return record;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === KNOWN_PRISMA_ERROR_MAP.UniquenessConstraintViolation) {
          throw new ConflictException({
            message: `Your company has already configured the ${systemWithIntegrations.uiName} connection.`,
            code: ERROR_CODE.Conflict,
          });
        }
      }

      throw err;
    }
  }

  async createExternalSystemConnectionAsset(
    companyId: string,
    connectionId: string,
    systemRequirementId: number,
    uiName: string,
    uiDescription: string,
    isSecret: boolean,
    value?: Prisma.InputJsonValue,
  ) {
    try {
      const input: Prisma.CompanyExternalSystemConnectionAssetUncheckedCreateInput =
        {
          companyId,
          connectionId,
          systemRequirementId,
          uiName,
          uiDescription,
          isSecret,
        };

      if (value) {
        input.value = value;
      }
      const record =
        await this.prismaClient.companyExternalSystemConnectionAsset.create({
          data: input,
          include: {
            connection: {
              include: {
                externalSystem: {
                  include: {
                    connectionRequirements: {
                      include: {
                        companyConnectionAssets: {
                          where: { companyId },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
      return record;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === KNOWN_PRISMA_ERROR_MAP.UniquenessConstraintViolation) {
          throw new ConflictException({
            message: `Your company has already created this connection asset. You may update it if you like.`,
            code: ERROR_CODE.Conflict,
          });
        }
      }

      throw err;
    }
  }

  async getAsset(
    companyId: string,
    systemRequirementType: $Enums.ExternalSystemConnectionRequirementType,
    systemName: $Enums.ExternalSystemName,
  ) {
    const asset =
      await this.prismaClient.companyExternalSystemConnectionAsset.findFirst({
        where: {
          companyId,
          systemRequirement: {
            type: systemRequirementType,
            system: {
              name: systemName,
            },
          },
        },
        include: { connection: true },
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
