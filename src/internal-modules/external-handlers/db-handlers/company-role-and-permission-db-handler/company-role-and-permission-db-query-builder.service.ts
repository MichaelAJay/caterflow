import { Injectable } from '@nestjs/common';
import { ICompanyRoleAndPermissionDbQueryBuilder } from './interfaces/company-role-and-permission-db-query-builder.service.interface';
import { $Enums, Prisma } from '@prisma/client';
import {
  IBuildCreateCompanyRoleArgs,
  IBuildUpdateCompanyRoleArgs,
} from './interfaces/query-builder-args.interface';
import { DefaultArgs } from '@prisma/client/runtime/library';

@Injectable()
export class CompanyRoleAndPermissionDbQueryBuilderService
  implements ICompanyRoleAndPermissionDbQueryBuilder
{
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
  ): Prisma.RoleCreateArgs[] {
    const companyRecords: Prisma.RoleCreateArgs[] =
      systemRolesWithPermissions.map(
        ({ name, description, permissions: rolePermissions }) => {
          const data: Prisma.RoleUncheckedCreateInput = {
            name,
            description,
            companyId,
            creatorId,
            isEditable: false,
          };

          if (rolePermissions.length > 0) {
            data.permissions = {
              connect: rolePermissions.map(({ id }) => ({ id })),
            };
          }

          return { data };
        },
      );
    return companyRecords;
  }
  buildCreateCompanyRoleQuery(
    input: IBuildCreateCompanyRoleArgs,
  ): Prisma.RoleCreateArgs {
    return {
      data: input,
    };
  }
  buildRetrieveRoleQuery(id: string): Prisma.RoleFindUniqueArgs<DefaultArgs> {
    return { where: { id } };
  }
  buildUpdateCompanyRoleQuery(
    id: string,
    updates: IBuildUpdateCompanyRoleArgs,
  ): Prisma.RoleUpdateArgs {
    const { permissions, ...roleUpdates } = updates;
    const data: Prisma.RoleUncheckedUpdateInput = roleUpdates;

    if (permissions) {
      const { add, remove } = permissions;
      const uniqueConnectIds = [...new Set(add || [])];

      // Filter out permissionIds that exist in both arrays only if remove is present
      const filteredConnectIds = remove
        ? uniqueConnectIds.filter((id) => !remove.includes(id))
        : uniqueConnectIds;

      if (filteredConnectIds.length > 0 || (remove || []).length > 0) {
        data.permissions = {};

        if (filteredConnectIds.length > 0) {
          data.permissions.connect = filteredConnectIds.map((id) => ({ id }));
        }

        if (remove && remove.length > 0) {
          data.permissions.disconnect = remove.map((id) => ({
            id,
          }));
        }
      }
    }

    return {
      where: { id },
      data,
    };
  }
  buildDeleteCompanyRoleQuery(
    id: string,
    companyId: string,
  ): Prisma.RoleDeleteArgs {
    return { where: { id, companyId } };
  }
  buildDeleteManyCompanyRolesQuery(
    ids: string[],
    companyId: string,
  ): Prisma.RoleDeleteManyArgs {
    return {
      where: {
        companyId,
        id: { in: ids },
      },
    };
  }
  buildCreateManyCompanyUserRolesQuery(
    roleIds: string[],
    userId: string,
    companyId: string,
    creatorId: string,
  ): Prisma.UserCompanyRoleCreateManyArgs {
    return {
      data: roleIds.map((roleId) => ({ roleId, userId, companyId, creatorId })),
      skipDuplicates: true,
    };
  }
  buildDeleteManyCompanyUserRolesQuery(
    roleIds: string[],
    userId: string,
    companyId: string,
  ): Prisma.UserCompanyRoleDeleteManyArgs {
    return {
      where: {
        userId,
        companyId,
        roleId: { in: roleIds },
      },
    };
  }
  buildFindFirstUserCompanyRoleWithPermission(
    userId: string,
    companyId: string,
    permission: $Enums.PermissionName,
  ): Prisma.UserCompanyRoleFindFirstArgs {
    return {
      where: {
        userId,
        companyId,
        role: {
          permissions: {
            some: {
              name: permission,
            },
          },
        },
      },
      select: {
        userId: true,
      },
    };
  }
}
