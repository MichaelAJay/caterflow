import { Prisma } from '@prisma/client';
import {
  IBuildCreateCateringCompanyArgs,
  IBuildRetrieveIntegrationListArgs,
} from './query-builder-args.interfaces';

export interface ICateringCompanyDbQueryBuilder {
  buildCreateCateringCompanyQuery(
    input: IBuildCreateCateringCompanyArgs,
  ): Prisma.CateringCompanyCreateArgs;
  buildRetrieveCompanyIntegrationsListWhereClause(
    companyId: string,
    query?: IBuildRetrieveIntegrationListArgs,
  ): Prisma.CompanyIntegrationWhereInput;
}
