import { IBuildGetCompanyIntegrationListArgs } from 'src/internal-modules/external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';

export interface ICateringCompanyService {
  /**
   * @param name company name
   * @param ownerId owner internal user.id
   */
  createCateringCompany(name: string, ownerId: string): Promise<any>;
  retrieveIntegrationsList(
    companyId: string,
    query?: IBuildGetCompanyIntegrationListArgs,
  ): Promise<any>;
  createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ): Promise<any>;
}
