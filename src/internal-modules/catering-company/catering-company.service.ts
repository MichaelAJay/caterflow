import { Injectable } from '@nestjs/common';
import { ICateringCompanyService } from './interfaces/catering-company.service.interface';
import { CateringCompanyDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CompanyRoleAndPermissionDbHandlerService } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';

@Injectable()
export class CateringCompanyService implements ICateringCompanyService {
  constructor(
    private readonly cateringCompanyDbHandler: CateringCompanyDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
    private readonly companyRoleDbHandler: CompanyRoleAndPermissionDbHandlerService,
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
}
