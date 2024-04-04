import { CompanyIntegrationOutputItem } from 'src/common/types/company-integration-list-item.type';
import { IBuildRetrieveIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

export interface ICateringCompanyService {
  /**
   * @param name company name
   * @param ownerId owner internal user.id
   */
  createCateringCompany(name: string, ownerId: string): Promise<any>;
  retrieveIntegrationsList(
    companyId: string,
    query?: IBuildRetrieveIntegrationListArgs,
  ): Promise<CompanyIntegrationOutputItem[]>;
}
