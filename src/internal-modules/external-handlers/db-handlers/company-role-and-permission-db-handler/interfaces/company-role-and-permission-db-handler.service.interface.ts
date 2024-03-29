import { $Enums } from '@prisma/client';
import {
  IBuildCreateCompanyRoleArgs,
  IBuildUpdateCompanyRoleArgs,
} from './query-builder-args.interface';

export interface ICompanyRoleAndPermissionDbHandler {
  /**
   * Create initial set of roles and assign creator as owner
   */
  initializeRolesAndAssignOwner: (
    companyId: string,
    creatorId: string,
  ) => Promise<any>;
  /**
   * @TODO ensure name is a valid, non-empty string in request validation step
   */
  createRole: (input: IBuildCreateCompanyRoleArgs) => Promise<any>;
  /**
   * Retrieve a role by PK
   * @param id Role PK
   */
  retrieveRole: (id: string) => Promise<any>;
  /**
   * Updates one existing role. Use to add and/or remove permissions from role.
   * Requester must have 'ManageCompanyRoles' permission
   * AND may not add or remove permissions which the requesting user does not have
   * @param id Role PK
   * @param updates may optionally include name, description, and permissions to add or remove
   */
  editRole: (id: string, updates: IBuildUpdateCompanyRoleArgs) => Promise<any>;
  /**
   * Deletes a set of roles for a company
   * Requester may only delete roles for which they have all permissions
   *
   * @TODO This needs sharpening up
   * @param ids
   * @param companyId
   */
  deleteRoles: (ids: string[], companyId: string) => Promise<any>;
  /**
   * Creates UserRole records.
   * Calling function must ensure that the user and each specified role belong to the target company
   * Requester MUST have each permission from each assigned role
   */
  addRolesToUser: (
    roleIds: string[],
    userId: string,
    companyId: string,
    creatorId: string,
  ) => Promise<any>;
  /**
   * Creates UserRole records.
   * Requester MUST have each permission from each assigned role
   */
  removeRolesFromUser: (
    roleIds: string[],
    userId: string,
    companyId: string,
  ) => Promise<any>;
  checkUserPermission: (
    userId: string,
    companyId: string,
    permissionName: $Enums.PermissionName,
  ) => Promise<boolean>;
  retrieveSelectUserPermissions: (
    userId: string,
    companyId: string,
    permissions: $Enums.PermissionName[],
  ) => Promise<Set<$Enums.PermissionName>>;
}
