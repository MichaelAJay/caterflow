import { Injectable } from '@nestjs/common';
import { ICateringCompanyService } from './interfaces/catering-company.service.interface';
import { CateringCompanyDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CompanyRoleAndPermissionDbHandlerService } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';
import { CompanyMapperService } from './company-mapper.service';
import { CompanyIntegrationOutputItem } from 'src/common/types/company-integration-list-item.type';
import { IBuildRetrieveCompanyIntegrationListArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { CreatedCompanyIntegration } from '../external-handlers/db-handlers/catering-company-db-handler/types/return/create-company-integration.return.type';

@Injectable()
export class CateringCompanyService implements ICateringCompanyService {
  constructor(
    private readonly cateringCompanyDbHandler: CateringCompanyDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
    private readonly companyRoleDbHandler: CompanyRoleAndPermissionDbHandlerService,
    private readonly companyMapper: CompanyMapperService,
  ) {}

  async createCateringCompany(name: string, ownerId: string): Promise<any> {
    const company = await this.cateringCompanyDbHandler.createCateringCompany(
      name,
      ownerId,
    );
    await this.companyRoleDbHandler.initializeRolesAndAssignOwner(
      company.id,
      ownerId,
    );
    await this.userDbHandler.updateUser(ownerId, { companyId: company.id });
    return;
  }

  /**
   * *******************
   * ***INTEGRATIONS ***
   * *******************
   */

  async retrieveIntegrationsList(
    companyId: string,
    query?: IBuildRetrieveCompanyIntegrationListArgs,
  ): Promise<CompanyIntegrationOutputItem[]> {
    const records =
      await this.cateringCompanyDbHandler.retrieveCompanyIntegrationsList(
        companyId,
        query,
      );

    const mappedList =
      this.companyMapper.mapCompanyIntegrationListForOutput(records);
    return mappedList;
  }

  async createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ): Promise<CreatedCompanyIntegration> {
    const results = await this.cateringCompanyDbHandler.createIntegration(
      companyId,
      templateId,
      creatorId,
    );
    return results;
  }
}
