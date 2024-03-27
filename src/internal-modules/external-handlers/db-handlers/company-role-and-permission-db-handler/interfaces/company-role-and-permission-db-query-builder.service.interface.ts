import { $Enums, Prisma } from '@prisma/client';

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
}
