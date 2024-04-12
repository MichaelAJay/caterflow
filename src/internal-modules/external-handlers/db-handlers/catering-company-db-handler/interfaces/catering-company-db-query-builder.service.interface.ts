import { $Enums, Prisma } from '@prisma/client';
import {
  IBuildCreateCateringCompanyArgs,
  IBuildRetrieveCompanyIntegrationListArgs,
} from './query-builder-args.interfaces';

export interface ICateringCompanyDbQueryBuilder {
  buildCreateCateringCompanyQuery(
    input: IBuildCreateCateringCompanyArgs,
  ): Prisma.CateringCompanyCreateArgs;
  buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
    companyId: string,
    queryInput?: IBuildRetrieveCompanyIntegrationListArgs,
  ): Omit<Prisma.CompanyIntegrationFindManyArgs, 'include'>;
  buildCreateCompanyIntegration(
    companyId: string,
    templateId: number,
    event: $Enums.IntegrationEvent,
    creatorId: string,
    existingAssetIds?: string[],
  ): Prisma.CompanyIntegrationCreateArgs;
  buildCreateCompanyIntegrationAsset(
    companyId: string,
    integrationRequirementId: number,
    type: $Enums.IntegrationAssetType,
    system: $Enums.ExternalSystem | null,
    isSecret: boolean,
    creatorId: string,
    menuId?: number,
    data?: Prisma.JsonValue,
    companyIntegrationIds?: { id: string }[],
  ): Prisma.CompanyIntegrationAssetCreateArgs;
}
