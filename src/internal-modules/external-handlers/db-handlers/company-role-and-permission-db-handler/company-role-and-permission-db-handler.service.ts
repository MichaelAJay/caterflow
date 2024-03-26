import { Injectable } from '@nestjs/common';
import { ICompanyRoleAndPermissionDbHandler } from './interfaces/company-role-and-permission-db-handler.service.interface';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';

@Injectable()
export class CompanyRoleAndPermissionDbHandlerService
  implements ICompanyRoleAndPermissionDbHandler
{
  constructor(
    private readonly companyRoleAndPermissionDbQueryBuilder: CompanyRoleAndPermissionDbQueryBuilderService,
    private readonly prismaClient: PrismaClientService,
  ) {}
}
