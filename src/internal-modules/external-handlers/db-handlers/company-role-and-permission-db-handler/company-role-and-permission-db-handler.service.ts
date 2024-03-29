import { Injectable } from '@nestjs/common';
import { ICompanyRoleAndPermissionDbHandler } from './interfaces/company-role-and-permission-db-handler.service.interface';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { $Enums } from '@prisma/client';
import { LogService } from '../../../../system/modules/log/log.service';
import {
  IBuildCreateCompanyRoleArgs,
  IBuildUpdateCompanyRoleArgs,
} from './interfaces/query-builder-args.interface';
import uuidUtils from '../../../../utility/functions/is_uuid';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import { ERROR_CODE } from '../../../../common/codes/error-codes';

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
  async initializeRoles(
    companyId: string,
    creatorId: string,
  ): Promise<boolean> {
    // Validate input & allow caller to handle
    if (![companyId, creatorId].every((input) => uuidUtils.isUUID(input))) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }
    try {
      // Get system roles with permissions

      // Could improve data shape by only including name, description, isEditable, and permission name
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

      if (roleCreateArgs.length === 0) {
        throw new Error('roleCreateArgs is empty');
      }

      await this.prismaClient.$transaction(
        roleCreateArgs.map((roleCreateArg) => {
          return this.prismaClient.role.create(roleCreateArg);
        }),
      );
      return true;
    } catch (err) {
      const stackTrace = err.stack ? err.stack : 'Stack trace unavailable';
      this.logService.error(err.message, stackTrace, {
        companyId,
        message: 'Company role initialization failed',
      });
      return false;
    }
  }
  async createRole(input: IBuildCreateCompanyRoleArgs) {
    if (
      ![input.companyId, input.creatorId].every((input) =>
        uuidUtils.isUUID(input),
      )
    ) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    await this.prismaClient.role.create(
      this.companyRoleAndPermissionDbQueryBuilder.buildCreateCompanyRoleQuery(
        input,
      ),
    );
  }
  async retrieveRole(id: string) {
    if (!uuidUtils.isUUID(id)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }
    const role = await this.prismaClient.role.findUnique(
      this.companyRoleAndPermissionDbQueryBuilder.buildRetrieveRoleQuery(id),
    );
    return role;
  }
  async editRole(id: string, updates: IBuildUpdateCompanyRoleArgs) {
    if (!uuidUtils.isUUID(id)) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }
    await this.prismaClient.role.update(
      this.companyRoleAndPermissionDbQueryBuilder.buildUpdateCompanyRoleQuery(
        id,
        updates,
      ),
    );
  }
  async deleteRoles(ids: string[], companyId: string) {
    if (!ids.every((input) => uuidUtils.isUUID(input))) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }

    if (ids.length === 0) {
      throw new Error('ids array may not be empty');
    }

    let res;
    if (ids.length === 1) {
      res = await this.prismaClient.role.delete(
        this.companyRoleAndPermissionDbQueryBuilder.buildDeleteCompanyRoleQuery(
          ids[0],
          companyId,
        ),
      );
    } else {
      res = await this.prismaClient.role.deleteMany(
        this.companyRoleAndPermissionDbQueryBuilder.buildDeleteManyCompanyRolesQuery(
          ids,
          companyId,
        ),
      );
    }
    return res;
  }
  async addRolesToUser(
    roleIds: string[],
    userId: string,
    companyId: string,
    creatorId: string,
  ) {
    if (
      ![...roleIds, userId, companyId, creatorId].every((input) =>
        uuidUtils.isUUID(input),
      )
    ) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }
    if (roleIds.length === 0) {
      throw new Error('role ids array may not be empty');
    }

    const res = await this.prismaClient.userCompanyRole.createMany(
      this.companyRoleAndPermissionDbQueryBuilder.buildCreateManyCompanyUserRolesQuery(
        roleIds,
        userId,
        companyId,
        creatorId,
      ),
    );
    return res;
  }
  async removeRolesFromUser(
    roleIds: string[],
    userId: string,
    companyId: string,
  ) {
    if (
      ![...roleIds, userId, companyId].every((input) => uuidUtils.isUUID(input))
    ) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }
    if (roleIds.length === 0) {
      throw new Error('role ids array may not be empty');
    }

    const res = await this.prismaClient.userCompanyRole.deleteMany(
      this.companyRoleAndPermissionDbQueryBuilder.buildDeleteManyCompanyUserRolesQuery(
        roleIds,
        userId,
        companyId,
      ),
    );
    return res;
  }
  async checkUserPermission(
    userId: string,
    companyId: string,
    permissionName: $Enums.PermissionName,
  ): Promise<boolean> {
    if (![userId, companyId].every((input) => uuidUtils.isUUID(input))) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }
    const record = await this.prismaClient.userCompanyRole.findFirst(
      this.companyRoleAndPermissionDbQueryBuilder.buildFindFirstUserCompanyRoleWithPermission(
        userId,
        companyId,
        permissionName,
      ),
    );
    return !!record;
  }
  async retrieveSelectUserPermissions(
    userId: string,
    companyId: string,
    permissions: $Enums.PermissionName[],
  ): Promise<Set<$Enums.PermissionName>> {
    if (![userId, companyId].every((input) => uuidUtils.isUUID(input))) {
      throw new InvalidUUIDError(ERROR_CODE.InvalidUUID);
    }
    if (permissions.length === 0) {
      throw new Error('cannot send empty array');
    }

    const userCompanyRolesWithPermissions =
      await this.prismaClient.userCompanyRole.findMany({
        where: {
          userId,
          companyId,
          role: {
            permissions: {
              some: {
                name: {
                  in: permissions,
                },
              },
            },
          },
        },
        select: {
          role: {
            select: {
              permissions: {
                where: {
                  name: {
                    in: permissions,
                  },
                },
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

    const permissionNames = userCompanyRolesWithPermissions.flatMap((ucr) =>
      ucr.role.permissions.map((permission) => permission.name),
    );

    return new Set(permissionNames);
  }
}
