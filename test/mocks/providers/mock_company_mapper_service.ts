import { ICompanyMapper } from 'src/internal-modules/catering-company/interfaces/company-mapper.service.interface';

export const mockCompanyMapper: ICompanyMapper = {
  mapCompanyIntegrationListForOutput: jest.fn(),
};
