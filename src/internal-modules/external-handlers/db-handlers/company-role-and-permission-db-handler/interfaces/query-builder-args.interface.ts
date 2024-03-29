import { Prisma } from '@prisma/client';

export type IBuildCreateCompanyRoleArgs = Omit<
  Pick<Prisma.RoleUncheckedCreateInput, 'name' | 'description'>,
  'companyId' | 'creatorId'
> & { companyId: string; creatorId: string };

export type IBuildUpdateCompanyRoleArgs = Pick<
  Prisma.RoleUncheckedUpdateInput,
  'name' | 'description'
> & {
  permissions?: {
    add?: number[];
    remove?: number[];
  };
};
