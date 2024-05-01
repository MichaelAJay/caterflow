import { IBuildGetManyQueryInputArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

export interface IIntegrationsService {
  getSystemIntegrations(query?: IBuildGetManyQueryInputArgs): Promise<any[]>;
  getExternalSystems(query?: any): Promise<any>;
}
