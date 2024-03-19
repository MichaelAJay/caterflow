import { AuthenticatedRequest } from 'src/api/interfaces/authenticated-request.interface';

export interface ICateringCompanyController {
  createCateringCompany(body: any, req: AuthenticatedRequest): Promise<any>;
}
