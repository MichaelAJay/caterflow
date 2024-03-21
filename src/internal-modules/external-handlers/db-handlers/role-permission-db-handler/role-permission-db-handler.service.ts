import { Injectable } from '@nestjs/common';
import { IRolePermissionDbHandler } from './interfaces/role-permission-db-handler.service.interface';
import { RolePermissionDbQueryBuilderService } from './role-permission-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';

@Injectable()
export class RolePermissionDbHandlerService
  implements IRolePermissionDbHandler
{
  constructor(
    private readonly rolePermissionDbQueryBuilder: RolePermissionDbQueryBuilderService,
    private readonly prismaClient: PrismaClientService,
  ) {}
}
