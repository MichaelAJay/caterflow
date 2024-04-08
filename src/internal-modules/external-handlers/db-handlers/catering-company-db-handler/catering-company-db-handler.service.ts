import { Injectable } from '@nestjs/common';
import { ICateringCompanyDbHandler } from './interfaces/catering-company-db-handler.service.interface';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { $Enums, CateringCompany } from '@prisma/client';
import { CompanyIntegrationListItem } from '../../../../common/types/company-integration-list-item.type';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import { ERROR_CODE } from '../../../../common/codes/error-codes';
import { IBuildRetrieveCompanyIntegrationListArgs } from './interfaces/query-builder-args.interfaces';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { CreatedCompanyIntegration } from './types/return/create-company-integration.return.type';

@Injectable()
export class CateringCompanyDbHandlerService
  implements ICateringCompanyDbHandler
{
  constructor(
    private readonly cateringCompanyDbQueryBuilder: CateringCompanyDbQueryBuilderService,
    private readonly systemIntegrationDbQueryBuilder: SystemIntegrationDbQueryBuilderService,
    private readonly prismaClient: PrismaClientService,
  ) {}

  async createCateringCompany(
    name: string,
    ownerId: string,
  ): Promise<CateringCompany> {
    if (!uuidUtils.isUUID(ownerId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    // Take care of known errors here
    const company = await this.prismaClient.cateringCompany.create(
      this.cateringCompanyDbQueryBuilder.buildCreateCateringCompanyQuery({
        name,
        ownerId,
      }),
    );
    return company;
  }

  /**
   * *******************
   * ***INTEGRATIONS ***
   * *******************
   */

  async retrieveCompanyIntegrationsList(
    companyId: string,
    query?: IBuildRetrieveCompanyIntegrationListArgs,
  ): Promise<CompanyIntegrationListItem[]> {
    if (!uuidUtils.isUUID(companyId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    const records = await this.prismaClient.companyIntegration.findMany({
      ...this.cateringCompanyDbQueryBuilder.buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
        companyId,
        query,
      ),
      include: {
        template: {
          select: {
            srcSystem: true,
            srcEntity: true,
            targetSystem: true,
            targetEntity: true,
          },
        },
      },
    });
    return records;
  }

  async countCompanyIntegrations(companyId: string): Promise<number> {
    if (!uuidUtils.isUUID(companyId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    // const ct = await this.prismaClient.companyIntegration.count({
    //   where: { companyId, template: {} },
    // });
    const ct = await this.prismaClient.companyIntegration.count({
      where: { companyId },
    });

    return ct;
  }

  async createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ): Promise<CreatedCompanyIntegration> {
    try {
      if (!uuidUtils.isUUID(companyId)) {
        throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
      }

      // Get IntegrationTemplate by id w/ requirements & company's assets
      const integration =
        await this.prismaClient.integrationTemplate.findUniqueOrThrow({
          ...this.systemIntegrationDbQueryBuilder.buildRetrieveIntegrationQueryWithoutInclude(
            templateId,
          ),
          include: {
            requirements: {
              include: {
                assets: {
                  where: {
                    companyId: companyId,
                  },
                  select: {
                    id: true,
                    menuId: true,
                    integrationRequirementId: true,
                    type: true,
                    system: true,
                    isTested: true,
                  },
                },
              },
            },
          },
        });

      const metRequirements = integration.requirements.filter(
        (requirement) => requirement.assets.length > 0,
      );
      const unmetRequirements = integration.requirements.filter(
        (requirement) => requirement.assets.length === 0,
      );

      const existingAssetIds = metRequirements.flatMap((requirement) =>
        requirement.assets.map((asset) => asset.id),
      );
      // Create company integration and attach all assets
      const companyIntegration =
        await this.prismaClient.companyIntegration.create(
          this.cateringCompanyDbQueryBuilder.buildCreateCompanyIntegration(
            companyId,
            templateId,
            integration.event,
            creatorId,
            existingAssetIds.length > 0 ? existingAssetIds : undefined,
          ),
        );
      return { companyIntegration, metRequirements, unmetRequirements };
    } catch (err) {
      // Known Prisma error on findUniqueOrThrow 'P2025'
      console.error('err', err);
      throw err;
    }
  }

  async createIntegrationAsset(
    companyId: string,
    requirementId: number,
    creatorId: string,
    menuId?: string,
  ): Promise<any> {
    if (!uuidUtils.isUUID(companyId) || (menuId && !uuidUtils.isUUID(menuId))) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    const requirement =
      await this.prismaClient.integrationRequirement.findUniqueOrThrow({
        where: { id: requirementId },
        include: {
          assets: {
            where: { companyId },
          },
        },
      });

    // If company requirement with asset is found, that's an error
    if (
      requirement.level === $Enums.IntegrationRequirementLevel.Company &&
      requirement.assets.length > 0
    ) {
      // throw err
      console.log('moo like a cow');
    }

    if (
      requirement.level === $Enums.IntegrationRequirementLevel.Menu &&
      !menuId
    ) {
      // throw err
      console.log('moo like a horse');
    }
  }
}
