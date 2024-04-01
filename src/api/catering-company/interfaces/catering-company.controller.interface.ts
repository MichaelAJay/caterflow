import {
  AuthenticatedRequest,
  AuthenticatedRequestForCompanyUser,
} from 'src/api/interfaces/authenticated-request.interface';

export interface ICateringCompanyController {
  createCateringCompany(body: any, req: AuthenticatedRequest): Promise<any>;
  getUsers(): Promise<any>;
  getIntegrations(req: AuthenticatedRequestForCompanyUser): Promise<any>;
  getIntegrationAssets(): Promise<any>;
}
