import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { $Enums } from '@prisma/client';
import { AuthenticatedRequest } from '../../../api/interfaces/authenticated-request.interface';
import { DataAccessService } from '../../../internal-modules/external-handlers/data-access/data-access.service';
import { CompanyRoleAndPermissionDbHandlerService } from '../../../internal-modules/external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';

const FULL_PERMISSIONS: Record<$Enums.PermissionName, string> = {
  ManageBilling: 'Manage Billing',
  ManageCompanyRoles: 'Manage Company Roles',
  ManageIntegrations: 'Manage Integrations',
  ManageIntegrationAssets: 'Manage Integration Assets',
  ManageRoleAssignments: 'Manage Role Assignments',
  ViewMessages: 'View Messages',
  ManageCompanyCaterers: 'Manage Company Caterers',
};

export const ALL_PERMISSIONS = Object.keys(
  FULL_PERMISSIONS,
) as $Enums.PermissionName[];

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly companyPermissionService: CompanyRoleAndPermissionDbHandlerService,
    private readonly dataAccessService: DataAccessService<
      Set<$Enums.PermissionName>
    >,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<$Enums.PermissionName[]>(
      'permissions',
      context.getHandler(),
    );
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as AuthenticatedRequest;
    const { user } = request;
    if (!(user && user.id && user.companyId)) {
      return false;
    }

    const userCompanyPermissions =
      await this.dataAccessService.retrieveAndCache(
        `${user.id}_${user.companyId}_permissions`,
        () =>
          this.companyPermissionService.retrieveSelectUserPermissions(
            user.id,
            user.companyId as string,
            ALL_PERMISSIONS,
          ),
      );

    return (
      !!userCompanyPermissions &&
      requiredPermissions.every((permission) =>
        userCompanyPermissions.has(permission),
      )
    );
  }
}
