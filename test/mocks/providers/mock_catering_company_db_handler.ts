import { ICateringCompanyDbHandler } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/catering-company-db-handler.service.interface';

export const mockCateringCompanyDbHandlerService: ICateringCompanyDbHandler = {
  createCateringCompany: jest.fn(),
  retrieveCompanyIntegrationsList: jest.fn(),
  countCompanyIntegrations: jest.fn(),
  createIntegration: jest.fn(),
  createIntegrationAsset: jest.fn(),
};
