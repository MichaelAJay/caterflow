import { Prisma } from '@prisma/client';
import {
  IBuildCreateCateringCompanyArgs,
  IBuildRetrieveIntegrationListArgs,
} from './query-builder-args.interfaces';

export interface ICateringCompanyDbQueryBuilder {
  buildCreateCateringCompanyQuery(
    input: IBuildCreateCateringCompanyArgs,
  ): Prisma.CateringCompanyCreateArgs;
  buildRetrieveCompanyIntegrationsListQueryWithoutInclude(
    companyId: string,
    queryInput?: IBuildRetrieveIntegrationListArgs,
  ): Omit<Prisma.CompanyIntegrationFindManyArgs, 'include'>;
}
