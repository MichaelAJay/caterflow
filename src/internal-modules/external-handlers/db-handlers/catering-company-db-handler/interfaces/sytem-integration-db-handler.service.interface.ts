import { IBuildRetrieveIntegrationListArgs } from './query-builder-args.interfaces';

export interface ISystemIntegrationDbHandler {
  retrieveList(query?: IBuildRetrieveIntegrationListArgs): Promise<any>;
}
