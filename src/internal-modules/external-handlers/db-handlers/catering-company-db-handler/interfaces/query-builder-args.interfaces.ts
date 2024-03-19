import { Prisma } from '@prisma/client';

export type IBuildCreateCateringCompanyArgs = Pick<
  Prisma.CateringCompanyUncheckedCreateInput,
  'name' | 'ownerId'
>;
