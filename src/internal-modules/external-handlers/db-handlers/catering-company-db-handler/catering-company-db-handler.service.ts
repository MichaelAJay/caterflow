import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ICateringCompanyDbHandler } from './interfaces/catering-company-db-handler.service.interface';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { $Enums, CateringCompany, Prisma } from '@prisma/client';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import { ERROR_CODE } from '../../../../common/codes/error-codes';
import {
  CompanyConnectionAsset,
  CompanyConnectionWithTypedAssets,
} from './types/company_connection_assets';
import { validateCompanyExternalSystemConnectionAssets } from './validators/company_external_connection_assets.validator';
import companyIntegrationAndConnectionUtilities from '../../../../internal-modules/catering-company/utility/company-integration-and-connection.utilities';
import {
  connectionDirection,
  ConnectionDirectionValues,
} from './types/external_systems_requirements';

@Injectable()
export class CateringCompanyDbHandlerService
  implements ICateringCompanyDbHandler
{
  constructor(
    private readonly cateringCompanyDbQueryBuilder: CateringCompanyDbQueryBuilderService,
    private readonly systemIntegrationDbQueryBuilder: SystemIntegrationDbQueryBuilderService,
    private readonly prismaClient: PrismaClientService,
  ) {}

  async updateExternalSystemConnection(
    connectionId: string,
    updates: Pick<
      Prisma.CompanyExternalSystemConnectionUncheckedUpdateInput,
      'inboundStatus' | 'outboundStatus' | 'assets'
    >,
    // include?: Prisma.CompanyExternalSystemConnectionInclude,
  ) {
    const { assets, ...updatedRecord } =
      await this.prismaClient.companyExternalSystemConnection.update({
        where: { id: connectionId },
        data: updates,
      });

    // Validate assets
    if (!validateCompanyExternalSystemConnectionAssets(assets)) {
      throw new Error('Invalid assets');
    }

    return { ...updatedRecord, assets };
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

  async getIntegrationsByConnectionIdAndDir(
    connectionId: string,
    dir: ConnectionDirectionValues,
  ) {
    let results;
    switch (dir) {
      case connectionDirection.In:
        results = await this.prismaClient.companyIntegration.findMany({
          where: {
            srcConnectionId: connectionId,
            targetConnection: {
              outboundStatus: $Enums.ConnectionStatus.READY,
            },
          },
        });
        break;
      case connectionDirection.Out:
        results = await this.prismaClient.companyIntegration.findMany({
          where: {
            targetConnectionId: connectionId,
            srcConnection: {
              OR: [
                { inboundStatus: $Enums.ConnectionStatus.READY },
                { inboundStatus: $Enums.ConnectionStatus.CONFIGURED_UNTESTED },
              ],
            },
          },
          include: {
            srcConnection: true,
          },
        });
        break;
      default:
        // Log and throw
        throw new Error('Bad data');
    }
    return results;
  }

  /**
   * THIS IS USED TO UPDATE INTEGRATIONS AFTER A SUCCESSFUL CONNECTION CHANGE
   * SHOULD ONLY be called if direction-related connection status is validated (see CompanyIntegrationAndConnectionService.processCompanyConnectionWithUpdatedAsset)
   * @param dir
   * @param connectionId
   * @returns
   */
  async updateIntegrationsByComplementaryConnectionId(
    connectionId: string,
    dir: ConnectionDirectionValues,
  ) {
    let where: Prisma.CompanyIntegrationWhereInput;
    switch (dir) {
      case connectionDirection.In:
        where = {
          srcConnectionId: connectionId,
          targetConnection: {
            outboundStatus: $Enums.ConnectionStatus.READY,
          },
        };
        break;
      case connectionDirection.Out:
        where = {
          targetConnectionId: connectionId,
          srcConnection: {
            OR: [
              { inboundStatus: $Enums.ConnectionStatus.READY },
              { inboundStatus: $Enums.ConnectionStatus.CONFIGURED_UNTESTED },
            ],
          },
        };
        break;
      default:
        // Redundant failover protection preferred over if/else blocks

        // Log and throw
        throw new Error('Bad data');
    }
    return await this.prismaClient.companyIntegration.updateMany({
      where,
      data: {
        status: $Enums.IntegrationStatus.ACTIVATABLE,
      },
    });
  }

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
    externalSystemNames: $Enums.ExternalSystemName[],
  ) {
    const records =
      await this.prismaClient.companyExternalSystemConnection.findMany({
        where: { companyId, systemName: { in: externalSystemNames } },
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
    const record =
      await this.prismaClient.companyExternalSystemConnection.findUniqueOrThrow(
        {
          where: { id: connectionId },
        },
      );

    const recordAssets = record.assets;
    if (!validateCompanyExternalSystemConnectionAssets(recordAssets)) {
      // log
      throw new InternalServerErrorException('Bad data');
    }
    return { ...record, assets: recordAssets };
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
            srcConnection: {
              outboundStatus: $Enums.ConnectionStatus.READY,
            },
          },
          {
            targetConnectionId: connectionId,
            targetConnection: {
              outboundStatus: $Enums.ConnectionStatus.READY,
            },
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
      const record = await this.prismaClient.companyIntegration.create({
        data: {
          companyId,
          templateId,
          uiName,
          srcConnectionId,
          targetConnectionId,
          event,
          creatorId,
          status: isConfigured ? 'ACTIVATABLE' : 'NON_ACTIVATABLE',
        },
      });
      return record;
    } catch (err) {
      // check for unique constraint violation
      throw err;
    }
  }

  async updateIntegrations(
    integrationIds: string[],
    updates: Pick<
      Prisma.CompanyIntegrationUncheckedUpdateManyInput,
      'srcConnectionId' | 'targetConnectionId' | 'status'
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
    systemName: $Enums.ExternalSystemName,
    uiName: string,
    assets: CompanyConnectionAsset,
  ): Promise<CompanyConnectionWithTypedAssets> {
    try {
      if (!uuidUtils.isUUID(companyId)) {
        throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
      }

      const [isOutboundConfigured, isInboundConfigured] = [
        connectionDirection.Out,
        connectionDirection.In,
      ].reduce((acc, dir) => {
        acc.push(
          companyIntegrationAndConnectionUtilities.isOneWayConfigured(
            assets,
            dir,
          ),
        );
        return acc;
      }, [] as boolean[]);

      const record =
        await this.prismaClient.companyExternalSystemConnection.create({
          data: {
            companyId,
            systemName,
            systemUIName: uiName,
            outboundStatus:
              $Enums.ConnectionStatus[
                isOutboundConfigured ? 'CONFIGURED_UNTESTED' : 'UNCONFIGURED'
              ],
            inboundStatus:
              $Enums.ConnectionStatus[
                isInboundConfigured ? 'CONFIGURED_UNTESTED' : 'UNCONFIGURED'
              ],
            assets,
          },
        });

      const createdAssets = record.assets;
      if (!validateCompanyExternalSystemConnectionAssets(createdAssets)) {
        throw new Error('Stuff is messed up');
      }
      return { ...record, assets: createdAssets };
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
