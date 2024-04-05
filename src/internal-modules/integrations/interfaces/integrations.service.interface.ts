import { IBuildRetrieveIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { ResponseIntegrationTemplate } from '../types/mapped/response-integration-template.type';

export interface IIntegrationsService {
  getSystemIntegrations(
    query?: IBuildRetrieveIntegrationListArgs,
  ): Promise<ResponseIntegrationTemplate[]>;
}
