import { ICateringCompanyService } from 'src/internal-modules/catering-company/interfaces/catering-company.service.interface';

export const mockCateringCompanyService: ICateringCompanyService = {
  createCateringCompany: jest.fn(),
  retrieveIntegrationsList: jest.fn(),
  createIntegration: jest.fn(),
  createIntegrationAsset: jest.fn(),
};
