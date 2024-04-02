import { CateringCompany } from '@prisma/client';
import { CompanyIntegrationListItem } from 'src/common/types/company-integration-list-item.type';

export interface ICateringCompanyDbHandler {
  createCateringCompany(
    name: string,
    ownerId: string,
  ): Promise<CateringCompany>;

  retrieveCompanyIntegrationsList(
    companyId: string,
  ): Promise<CompanyIntegrationListItem[]>;
}
