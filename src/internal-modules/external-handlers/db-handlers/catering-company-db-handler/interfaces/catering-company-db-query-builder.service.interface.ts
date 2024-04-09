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
}
