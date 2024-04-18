import { CreateIntegrationAssetRequestBody } from 'src/api/catering-company/interfaces/request/body/post.create-integration-asset.body.type';
import { CompanyIntegrationOutputItem } from 'src/common/types/company-integration-list-item.type';
import { IBuildRetrieveCompanyIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { CreatedCompanyIntegration } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/types/return/create-company-integration.return.type';

export interface ICateringCompanyService {
  /**
   * @param name company name
   * @param ownerId owner internal user.id
   */
  createCateringCompany(name: string, ownerId: string): Promise<any>;
  retrieveIntegrationsList(
    companyId: string,
    query?: IBuildRetrieveCompanyIntegrationListArgs,
  ): Promise<CompanyIntegrationOutputItem[]>;
  createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ): Promise<CreatedCompanyIntegration>;
}
