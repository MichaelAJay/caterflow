import { Injectable } from '@nestjs/common';
import { ISystemIntegrationDbQueryBuilder } from './interfaces/system-integration-db-query-builder.service.interface';
import { IBuildGetManyQueryInputArgs } from './interfaces/query-builder-args.interfaces';

@Injectable()
export class SystemIntegrationDbQueryBuilderService
  implements ISystemIntegrationDbQueryBuilder
{
  buildFindManyQuery(queryInput?: IBuildGetManyQueryInputArgs): {
    take: number;
    skip: number;
  } {
    const PG_NUM = queryInput && queryInput.pg ? queryInput.pg : 1;
    const PER_PAGE = queryInput && queryInput.perPage ? queryInput.perPage : 10;

    const query = {
      take: PER_PAGE,
      skip: (PG_NUM - 1) * PER_PAGE,
    };
    return query;
  }
}
