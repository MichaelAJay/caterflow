import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ISystemIntegrationDbQueryBuilder } from './interfaces/system-integration-db-query-builder.service.interface';
import { IBuildRetrieveIntegrationListArgs } from './interfaces/query-builder-args.interfaces';
import queryBuilderUtilities from './utilities/query-builder-utilities';

@Injectable()
export class SystemIntegrationDbQueryBuilderService
  implements ISystemIntegrationDbQueryBuilder
{
  buildRetrieveIntegrationsListQueryWithoutInclude(
    queryInput?: IBuildRetrieveIntegrationListArgs,
  ): Omit<Prisma.IntegrationTemplateFindManyArgs, 'include'> {
    const DEFAULT_PG_NUM = 1;
    const DEFAULT_PER_PAGE = 10;

    const PG_NUM = queryInput && queryInput.pg ? queryInput.pg : DEFAULT_PG_NUM;
    const PER_PAGE =
      queryInput && queryInput.perPage ? queryInput.perPage : DEFAULT_PER_PAGE;

    const query: Omit<Prisma.IntegrationTemplateFindManyArgs, 'include'> = {
      take: PER_PAGE,
    };

    if (
      queryInput &&
      (queryInput.templateSrcSystem || queryInput.templateTargetSystem)
    ) {
      query.where =
        queryBuilderUtilities.buildRetrieveIntegrationTemplatesListWhereClause(
          queryInput,
        );
    }

    if (PG_NUM > 1) {
      query.skip = (PG_NUM - 1) * PER_PAGE;
    }

    return query;
  }
}
