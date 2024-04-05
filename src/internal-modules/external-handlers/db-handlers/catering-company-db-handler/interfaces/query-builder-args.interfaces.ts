import { Prisma } from '@prisma/client';

export type IBuildCreateCateringCompanyArgs = Pick<
  Prisma.CateringCompanyUncheckedCreateInput,
  'name' | 'ownerId'
>;

export interface IBuildRetrieveCompanyIntegrationListArgs {
  pg?: number;
  perPage?: number;
  isConfigured?: boolean;
  isActive?: boolean;
  createdSince?: Date;
  templateSrcSystem?: 'ezCater';
  templateTargetSystem?: 'ezCater' | 'Nutshell';
  sort?: 'created_asc' | 'created_desc';
}
