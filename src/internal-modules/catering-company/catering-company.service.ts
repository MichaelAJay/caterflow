import { Injectable } from '@nestjs/common';
import { ICateringCompanyService } from './interfaces/catering-company.service.interface';
import { CateringCompanyDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CompanyRoleAndPermissionDbHandlerService } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';
import { CompanyMapperService } from './company-mapper.service';
import { IBuildGetCompanyIntegrationListArgs } from '../external-handlers/db-handlers/catering-company-db-handler/interfaces/query-builder-args.interfaces';
import { SecretManagerService } from '../external-handlers/secret-manager/secret-manager.service';

@Injectable()
export class CateringCompanyService implements ICateringCompanyService {
  constructor(
    private readonly cateringCompanyDbHandler: CateringCompanyDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
    private readonly companyRoleDbHandler: CompanyRoleAndPermissionDbHandlerService,
    private readonly companyMapper: CompanyMapperService,
    private readonly secretManager: SecretManagerService,
  ) {}

  /**
   * Refactor 20 Apr 24
   */
  async createCateringCompany(name: string, ownerId: string): Promise<any> {
    const company = await this.cateringCompanyDbHandler.createCateringCompany(
      name,
      ownerId,
    );
    await this.companyRoleDbHandler.initializeRolesAndAssignOwner(
      company.id,
      ownerId,
    );
    return;
  }

  /**
   * *******************
   * ***INTEGRATIONS ***
   * *******************
   */

  async retrieveEzCaterWebhookUrl(companyId: string) {
    const baseUrl = 'http://localhost:8080'; // @TODO fix
    return { url: `${baseUrl}/ezcater-webhook-receiver/${companyId}` };
  }

  async retrieveIntegrationsList(
    companyId: string,
    query?: IBuildGetCompanyIntegrationListArgs,
  ): Promise<any> {
    // const records =
    //   await this.cateringCompanyDbHandler.retrieveCompanyIntegrationsList(
    //     companyId,
    //     query,
    //   );
    // const mappedList =
    //   this.companyMapper.mapCompanyIntegrationListForOutput(records);
    // return mappedList;
    // return records;
  }

  async createIntegration(
    companyId: string,
    templateId: number,
    creatorId: string,
  ): Promise<any> {
    // const results = await this.cateringCompanyDbHandler.createIntegration(
    //   companyId,
    //   templateId,
    //   creatorId,
    // );
    // return results;
  }
}
