import { ISystemIntegrationDbQueryBuilder } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/system-integration-db-query-builder.service.interface';

export const mockSystemIntegrationDbQueryBuilder: ISystemIntegrationDbQueryBuilder =
  {
    buildRetrieveIntegrationsListQueryWithoutInclude: jest.fn(),
  };
