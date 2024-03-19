import { ICateringCompanyDbQueryBuilder } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/catering-company-db-query-builder.service.interface';

export const mockCateringCompanyDbQueryBuilderService: ICateringCompanyDbQueryBuilder =
  {
    buildCreateCateringCompanyQuery: jest.fn(),
  };
