import { Injectable } from '@nestjs/common';
import { ICompanyRoleAndPermissionDbQueryBuilder } from './interfaces/company-role-and-permission-db-query-builder.service.interface';

@Injectable()
export class CompanyRoleAndPermissionDbQueryBuilderService
  implements ICompanyRoleAndPermissionDbQueryBuilder {}
