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

      // invalidMenuRequirement will contain each requirement with level "menu" only if menus (below) length is 0
      const invalidMenuRequirements: IntegrationRequirement[] = [];
      const creates: Prisma.CompanyIntegrationAssetUncheckedCreateWithoutIntegrationsInput[] =
        [];
      const connects: Prisma.CompanyIntegrationAssetWhereUniqueInput[] = [];

      const menus = await this.prismaClient.companyMenu.findMany({
        where: { companyId },
      });

      /**
       * For each requirement:
       * If it has 'company' level
       * - If it is associated with an existing company asset, connect that asset to the created integration
       * - Else, create an asset with menuId null
       * Else if it has 'menu' level
       * - If company has no menus, add requirement to invalid menu requirements (for return)
       * - Else for each menu, create or connect assets.
       * -- Find matching asset by menuId
       * --- If found, connect that asset to the created integration
       * --- Else, create an asset, including the menu's id
       */
      for (const requirement of integration.requirements) {
        const { assets, ...integrationRequirement } = requirement;
        if (requirement.level === $Enums.IntegrationRequirementLevel.Company) {
          if (assets.length === 1) {
            connects.push({
              id: assets[0].id,
            });
          } else {
            const data: Prisma.CompanyIntegrationAssetUncheckedCreateWithoutIntegrationsInput =
              {
                companyId,
                integrationRequirementId: integrationRequirement.id,
                type: integrationRequirement.type,
                system: integrationRequirement.system,
                creatorId,
              };
            // This should be the requirements for create & connect asset
            creates.push(data);
          }
        } else if (
          requirement.level === $Enums.IntegrationRequirementLevel.Menu
        ) {
          // What to do if menus is empty?
          if (menus.length === 0) {
            // Menu-level requirement requires a menu id - the created integration could never run without this
            invalidMenuRequirements.push(integrationRequirement);
          } else {
            for (const menu of menus) {
              // Find matching requirement asset
              const matchingAsset = assets.find(
                (asset) => asset.menuId === menu.id,
              );
              if (matchingAsset) {
                connects.push({ id: matchingAsset.id });
              } else {
                creates.push(
                  this.cateringCompanyDbQueryBuilder.buildCreateCompanyIntegrationAssetCreate(
                    companyId,
                    integrationRequirement,
                    creatorId,
                    menu.id,
                  ),
                );
              }
            }
          }
        }
      }

      // Create company integration and attach all assets
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
      console.error('err', err);
      throw err;
    }
  }

  async createIntegrationAsset(
    companyId: string,
    requirementId: number,
    creatorId: string,
    isSecret: boolean,
    menuId?: number,
    data?: JsonValue,
  ): Promise<CompanyIntegrationAssetWithIntegrations> {
    if (!(uuidUtils.isUUID(companyId) && uuidUtils.isUUID(creatorId))) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    // Throws if not found (Prisma known error P2025)
    const requirement: IntegrationRequirement & {
      assets: { id: string }[];
      templates: (IntegrationTemplate & { integrations: { id: string }[] })[];
    } = await this.retrieveTargetIntegrationRequirementWithCompanyAssociations(
      requirementId,
      companyId,
    );

    if (isSecret !== requirement.isSecret) {
      throw new Error('Non-matching secret flag');
    }

    // If company requirement with asset is found, that's an error
    if (
      requirement.level === $Enums.IntegrationRequirementLevel.Company &&
      requirement.assets.length > 0
    ) {
      throw new Error(
        'Each "Company" type requirement may be referenced by only one company asset. Do you want to remove your previous asset and replace it with this one?',
      );
    }

    if (
      requirement.level === $Enums.IntegrationRequirementLevel.Menu &&
      !menuId
    ) {
      throw new Error(
        'This requirement is a Menu type requirement, and a menuId was not provided',
      );
    }

    // Uniqueness ensured since each integration references exactly one template
    const companyIntegrationIds: { id: string }[] = [];
    // Favors reduced memory overhead
    requirement.templates.forEach((template) => {
      template.integrations.forEach((integration) =>
        companyIntegrationIds.push({ id: integration.id }),
      );
    });

    // add updated assets
    const asset = await this.prismaClient.companyIntegrationAsset.create({
      ...this.cateringCompanyDbQueryBuilder.buildCreateCompanyIntegrationAsset(
        companyId,
        requirement.id,
        requirement.type,
        requirement.system,
        isSecret,
        creatorId,
        menuId,
        data,
        // Determines integrations to include (below)
        companyIntegrationIds.length > 0 ? companyIntegrationIds : undefined,
      ),
      include: {
        // Includes all integrations created directly above
        integrations: {
          include: {
            // Assets on integration
            assets: true,
            template: {
              include: {
                requirements: {
                  include: {
                    // Assets which should be on integration
                    assets: {
                      where: {
                        companyId,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Think about something like - the following integrations were updated.

    // Actually, with regard to the integrations... it would maybe be worth confirming whether or not they're completed after this asset comes in

    return asset;
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
