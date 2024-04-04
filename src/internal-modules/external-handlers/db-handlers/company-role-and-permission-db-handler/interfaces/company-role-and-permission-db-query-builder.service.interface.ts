import { $Enums, Prisma } from '@prisma/client';
import {
  IBuildCreateCompanyRoleArgs,
  IBuildUpdateCompanyRoleArgs,
} from './query-builder-args.interface';

export interface ICompanyRoleAndPermissionDbQueryBuilder {
  buildCreateManySingleCompanyRolesQuery(
    systemRolesWithPermissions: ({
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
    })[],
    companyId: string,
    creatorId: string,
  ): Prisma.RoleCreateArgs[];
  buildCreateUserCompanyRoleQuery(
    roleId: string,
    creatorId: string,
    companyId: string,
  ): Prisma.UserCompanyRoleCreateArgs;
  buildCreateCompanyRoleQuery(
    input: IBuildCreateCompanyRoleArgs,
  ): Prisma.RoleCreateArgs;
  buildRetrieveRoleQuery(id: string): Prisma.RoleFindUniqueArgs;
  /**
   * When a permission id is marked both for addition to the role and removal from the role, the permission will be removed.
   */
  buildUpdateCompanyRoleQuery(
    id: string,
    updates: IBuildUpdateCompanyRoleArgs,
  ): Prisma.RoleUpdateArgs;
  buildDeleteCompanyRoleQuery(
    id: string,
    companyId: string,
  ): Prisma.RoleDeleteArgs;
  buildDeleteManyCompanyRolesQuery(
    ids: string[],
    companyId: string,
  ): Prisma.RoleDeleteManyArgs;
  buildCreateManyCompanyUserRolesQuery(
    roleIds: string[],
    userId: string,
    companyId: string,
    creatorId: string,
  ): Prisma.UserCompanyRoleCreateManyArgs;
  buildDeleteManyCompanyUserRolesQuery(
    roleIds: string[],
    userId: string,
    companyId: string,
  ): Prisma.UserCompanyRoleDeleteManyArgs;
  buildFindFirstUserCompanyRoleWithPermission(
    userId: string,
    companyId: string,
    permission: $Enums.PermissionName,
  ): Prisma.UserCompanyRoleFindFirstArgs;
}
