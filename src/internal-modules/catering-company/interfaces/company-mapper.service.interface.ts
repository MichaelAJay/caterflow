import {
  CompanyIntegrationListItem,
  CompanyIntegrationOutputItem,
} from 'src/common/types/company-integration-list-item.type';

export interface ICompanyMapper {
  mapCompanyIntegrationListForOutput(
    list: CompanyIntegrationListItem[],
  ): CompanyIntegrationOutputItem[];
}
