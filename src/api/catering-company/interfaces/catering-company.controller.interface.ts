import {
  AuthenticatedRequest,
  AuthenticatedRequestForCompanyUser,
} from 'src/api/interfaces/authenticated-request.interface';
import { CompanyIntegrationOutputItem } from 'src/common/types/company-integration-list-item.type';
import { IBuildRetrieveCompanyIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

export interface ICateringCompanyController {
  createCateringCompany(body: any, req: AuthenticatedRequest): Promise<any>;
  getUsers(): Promise<any>;

  /**
   * ********************
   * *** INTEGRATIONS ***
   * ********************
   */

  getIntegrations(
    req: AuthenticatedRequestForCompanyUser,
    query: IBuildRetrieveCompanyIntegrationListArgs,
  ): Promise<CompanyIntegrationOutputItem[]>;
  getIntegrationAssets(): Promise<any>;
  createIntegration(
    req: AuthenticatedRequestForCompanyUser,
    templateId: number,
  ): Promise<any>;
  createIntegrationAsset(
    req: AuthenticatedRequestForCompanyUser,
    requirementId: number,
  ): Promise<any>;
}
