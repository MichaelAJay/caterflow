import { IBuildGetManyQueryInputArgs } from './query-builder-args.interfaces';

export interface ISystemIntegrationDbQueryBuilder {
  buildFindManyQuery(queryInput?: IBuildGetManyQueryInputArgs): {
    take: number;
    skip: number;
  };
}
