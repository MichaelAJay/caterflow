import { IBuildGetManyQueryInputArgs } from './query-builder-args.interfaces';

export interface ISystemIntegrationDbHandler {
  getSystemIntegrations(query?: IBuildGetManyQueryInputArgs): Promise<any>;
  getExternalSystems(query?: any): Promise<any>;
}
