import {
  AuthenticatedRequest,
  AuthenticatedRequestForCompanyUser,
} from 'src/api/interfaces/authenticated-request.interface';
import { IBuildRetrieveIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

export interface ICateringCompanyController {
  createCateringCompany(body: any, req: AuthenticatedRequest): Promise<any>;
  getUsers(): Promise<any>;
  getIntegrations(
    req: AuthenticatedRequestForCompanyUser,
    query: IBuildRetrieveIntegrationListArgs,
  ): Promise<any>;
  getIntegrationAssets(): Promise<any>;
}
