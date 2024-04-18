import { Injectable } from '@nestjs/common';
import { ICateringCompanyDbHandler } from './interfaces/catering-company-db-handler.service.interface';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import {
  $Enums,
  CateringCompany,
  IntegrationRequirement,
  IntegrationTemplate,
  Prisma,
} from '@prisma/client';
import { CompanyIntegrationListItem } from '../../../../common/types/company-integration-list-item.type';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import { ERROR_CODE } from '../../../../common/codes/error-codes';
import { IBuildRetrieveCompanyIntegrationListArgs } from './interfaces/query-builder-args.interfaces';
import { SystemIntegrationDbQueryBuilderService } from './system-integration-db-query-builder.service';
import { CreatedCompanyIntegration } from './types/return/create-company-integration.return.type';
import { JsonValue } from '@prisma/client/runtime/library';
import { IntegrationRequirementWithCompanyAssociations } from './types/integration-requirement-with-company-associations.type';
import { CompanyIntegrationAssetWithIntegrations } from './types/return/asset-with-integrations.return.type';
import companyDbHandlerUtilities from './utilities/db-handler-utilities';

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

  /**
   * @TODO update tests
   */
  async createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ): Promise<CreatedCompanyIntegration> {
    try {
      if (!uuidUtils.isUUID(companyId) && uuidUtils.isUUID(creatorId)) {
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
                  },
                },
              },
            },
          },
        });

      const menus = await this.prismaClient.companyMenu.findMany({
        where: { companyId },
        select: { id: true },
      });

      const { connects, creates, invalidMenuRequirements } =
        companyDbHandlerUtilities.buildCreateIntegration_AssetCreatesAndConnects(
          companyId,
          integration.requirements,
          menus,
          creatorId,
        );

      // Create company integration and connect or create all assets
      const companyIntegration =
        await this.prismaClient.companyIntegration.create({
          ...this.cateringCompanyDbQueryBuilder.buildCreateCompanyIntegration(
            companyId,
            templateId,
            integration.event,
            creatorId,
            connects.length > 0 ? connects : undefined,
            creates.length > 0 ? creates : undefined,
          ),
          // Think about reducing what's returned from the query
          include: { assets: true },
        });
      return { companyIntegration, invalidMenuRequirements };
    } catch (err) {
      // Known Prisma error on findUniqueOrThrow 'P2025'
      // Known Prisma error on uniqueness constraint (asset with non-unique integrationRequirementId and (null) menuId)
      // console.error('err', err);
      throw err;
    }
  }

  async retrieveTargetIntegrationRequirementWithCompanyAssociations(
    requirementId: number,
    companyId: string,
  ): Promise<IntegrationRequirementWithCompanyAssociations> {
    if (!uuidUtils.isUUID(companyId)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    const requirement =
      await this.prismaClient.integrationRequirement.findUniqueOrThrow({
        where: { id: requirementId },
        include: {
          // All assets that reference the integration requirement and that belong to the company
          assets: {
            where: { companyId },
            select: { id: true },
          },
          // All templates that are referenced by at least one integration that belongs to the company
          templates: {
            where: {
              integrations: {
                some: { companyId },
              },
            },
            // Include all company integrations which reference the template and that belong to the company
            include: {
              integrations: { where: { companyId }, select: { id: true } },
            },
          },
        },
      });

    return requirement;
  }
}
