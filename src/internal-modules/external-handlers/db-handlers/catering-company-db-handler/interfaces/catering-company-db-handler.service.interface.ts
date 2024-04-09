import { CateringCompany } from '@prisma/client';
import { CompanyIntegrationListItem } from 'src/common/types/company-integration-list-item.type';
import { IBuildRetrieveCompanyIntegrationListArgs } from './query-builder-args.interfaces';
import { CreatedCompanyIntegration } from '../types/return/create-company-integration.return.type';

export interface ICateringCompanyDbHandler {
  createCateringCompany(
    name: string,
    ownerId: string,
  ): Promise<CateringCompany>;

  retrieveCompanyIntegrationsList(
    companyId: string,
    query?: IBuildRetrieveCompanyIntegrationListArgs,
  ): Promise<CompanyIntegrationListItem[]>;

  countCompanyIntegrations(companyId: string): Promise<number>;
  createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ): Promise<CreatedCompanyIntegration>;
  createIntegrationAsset(
    companyId: string,
    requirementId: number,
    creatorId: string,
    menuId?: string,
  ): Promise<any>;
}
