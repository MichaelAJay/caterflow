import { Prisma } from '@prisma/client';

export type IBuildCreateCateringCompanyArgs = Pick<
  Prisma.CateringCompanyUncheckedCreateInput,
  'name' | 'ownerId'
>;

export interface IBuildGetManyQueryInputArgs {
  pg?: number;
  perPage?: number;
}

export interface IBuildGetCompanyIntegrationListArgs
  extends IBuildGetManyQueryInputArgs {
  isConfigured?: boolean;
  isActive?: boolean;
  createdSince?: Date;
  sort?: 'created_asc' | 'created_desc';
}
