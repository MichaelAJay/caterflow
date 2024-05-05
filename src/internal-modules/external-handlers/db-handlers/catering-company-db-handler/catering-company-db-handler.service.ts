import { Injectable } from '@nestjs/common';
import { ICateringCompanyDbHandler } from './interfaces/catering-company-db-handler.service.interface';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { CateringCompany, Prisma } from '@prisma/client';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import { ERROR_CODE } from '../../../../common/codes/error-codes';

@Injectable()
export class CateringCompanyDbHandlerService
  implements ICateringCompanyDbHandler
{
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

  async createExternalSystemConnection(
    companyId: string,
    systemId: number,
    ownerId: string,
    srcFor: { id: string }[],
    targetFor: { id: string }[],
  ) {
    if (!(uuidUtils.isUUID(companyId) && uuidUtils.isUUID(ownerId))) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    const { uiName: systemUIName } =
      await this.prismaClient.externalSystem.findUniqueOrThrow({
        where: { id: systemId },
        select: { uiName: true },
      });

    const record =
      await this.prismaClient.companyExternalSystemConnection.create({
        data: {
          companyId,
          systemId,
          systemUIName,
          srcFor: {
            connect: srcFor,
          },
          targetFor: {
            connect: targetFor,
          },
        },
        include: {
          externalSystem: {
            include: {
              connectionRequirements: true,
              srcFor: {
                include: {
                  integrations: { where: { companyId }, select: { id: true } },
                },
              },
              targetFor: {
                include: {
                  integrations: { where: { companyId }, select: { id: true } },
                },
              },
            },
          },
        },
      });

    // uniqueness constraint on companyId, systemId
    return record;
  }

  async createExternalSystemConnectionAsset(
    companyId: string,
    connectionId: string,
    systemRequirementId: number,
    uiName: string,
    uiDescription: string,
    value?: Prisma.InputJsonValue,
  ) {
    const input: Prisma.CompanyExternalSystemConnectionAssetUncheckedCreateInput =
      {
        companyId,
        connectionId,
        systemRequirementId,
        uiName,
        uiDescription,
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
  }
}
