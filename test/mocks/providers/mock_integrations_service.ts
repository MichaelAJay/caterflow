import { IIntegrationsService } from 'src/internal-modules/integrations/interfaces/integrations.service.interface';

export const mockIntegrationsService: IIntegrationsService = {
  getSystemIntegrations: jest.fn(),
  getExternalSystems: jest.fn(),
};
