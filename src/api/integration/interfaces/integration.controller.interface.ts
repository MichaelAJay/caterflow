import { IBuildRetrieveIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

/**
 * This interface should only expose GET paths
 */
export interface IIntegrationController {
  getIntegrations(query: IBuildRetrieveIntegrationListArgs): Promise<any>;
}
