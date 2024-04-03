import { CompanyIntegrationOutputItem } from 'src/common/types/company-integration-list-item.type';

export interface ICateringCompanyService {
  /**
   * @param name company name
   * @param ownerId owner internal user.id
   */
  createCateringCompany(name: string, ownerId: string): Promise<any>;
  retrieveIntegrationsList(
    companyId: string,
  ): Promise<CompanyIntegrationOutputItem[]>;
}
