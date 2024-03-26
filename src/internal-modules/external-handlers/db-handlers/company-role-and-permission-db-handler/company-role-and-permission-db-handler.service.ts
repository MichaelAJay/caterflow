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
  // Called once per company on creation
  async initializeRoles() {
    // Get system roles with permissions
    // Create company roles with matching names and permissions. isEditable false.
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
