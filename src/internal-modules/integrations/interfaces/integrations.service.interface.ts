import { IBuildRetrieveIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

export interface IIntegrationsService {
  getSystemIntegrations(
    query?: IBuildRetrieveIntegrationListArgs,
  ): Promise<any>;
}
