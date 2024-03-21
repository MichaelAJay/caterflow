import { Injectable } from '@nestjs/common';
import { IRolePermissionDbQueryBuilder } from './interfaces/role-permission-db-query-builder.service.interface';

@Injectable()
export class RolePermissionDbQueryBuilderService
  implements IRolePermissionDbQueryBuilder {}
