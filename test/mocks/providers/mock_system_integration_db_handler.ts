import { ISystemIntegrationDbHandler } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/sytem-integration-db-handler.service.interface';

export const mockSystemIntegrationDbHandler: ISystemIntegrationDbHandler = {
  getSystemIntegrations: jest.fn(),
  getExternalSystems: jest.fn(),
};
