import { Injectable } from '@nestjs/common';
import { ICompanyRoleAndPermissionDbHandler } from './interfaces/company-role-and-permission-db-handler.service.interface';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { $Enums } from '@prisma/client';
import { LogService } from '../../../../system/modules/log/log.service';

@Injectable()
export class CompanyRoleAndPermissionDbHandlerService
  implements ICompanyRoleAndPermissionDbHandler
{
  constructor(
    private readonly companyRoleAndPermissionDbQueryBuilder: CompanyRoleAndPermissionDbQueryBuilderService,
    private readonly prismaClient: PrismaClientService,
    private readonly logService: LogService,
  ) {}
  // Called once per company on creation
  async initializeRoles(companyId: string, creatorId: string) {
    try {
      // Get system roles with permissions
      const systemRolesWithPermissions: ({
        permissions: {
          id: number;
          name: $Enums.PermissionName;
        }[];
      } & {
        id: string;
        name: string;
        description: string;
        companyId: string | null;
        creatorId: string;
        isEditable: boolean;
      })[] = await this.prismaClient.role.findMany({
        where: { companyId: null },
        include: {
          permissions: true,
        },
      });

      // Create company roles with matching names and isEditable false.
      const roleCreateArgs =
        this.companyRoleAndPermissionDbQueryBuilder.buildCreateManySingleCompanyRolesQuery(
          systemRolesWithPermissions,
          companyId,
          creatorId,
        );

      await this.prismaClient.$transaction(
        roleCreateArgs.map((roleCreateArg) => {
          return this.prismaClient.role.create(roleCreateArg);
        }),
      );
    } catch (err) {
      const stackTrace = err.stack ? err.stack : 'Stack trace unavailable';
      this.logService.error(err.message, stackTrace, {
        companyId,
        message: 'Company role initialization failed',
      });
      throw err;
    }
  }
  async createRole() {
    // Get user permissions - must contain 'ManageCompanyRoles'
    // // Create Role with no permissions
  }
  async editRole() {
    // Get user permissions - must contain 'ManageCompanyRoles'
    // Edit role name, or add/remove permissions.
    // If permissions are added or remove, the user must have that permission to produce an effect
  }
  async deleteRole() {
    // Get user permissions - must contain 'ManageCompanyRoles'
    // Ensure user has ALL permissions associated with role they are deleting
    // Remove role from all users
  }
  async assignRolesToUser() {}
  async unassignRolesToUser() {}
  async checkUserPermission() {}
}
