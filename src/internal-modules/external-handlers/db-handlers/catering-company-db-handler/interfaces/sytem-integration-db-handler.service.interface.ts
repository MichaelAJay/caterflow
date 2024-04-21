import { IBuildRetrieveIntegrationListArgs } from './query-builder-args.interfaces';

export interface ISystemIntegrationDbHandler {
  getSystemIntegrations(
    query?: IBuildRetrieveIntegrationListArgs,
  ): Promise<any>;
  getExternalSystems(query?: any): Promise<any>;
}
