import { Prisma } from '@prisma/client';
import { IBuildRetrieveIntegrationListArgs } from './query-builder-args.interfaces';

export interface ISystemIntegrationDbQueryBuilder {
  buildRetrieveIntegrationsListQueryWithoutInclude(
    queryInput?: IBuildRetrieveIntegrationListArgs,
  ): Omit<Prisma.IntegrationTemplateFindManyArgs, 'include'>;
}
