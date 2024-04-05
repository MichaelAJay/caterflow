import { Prisma } from '@prisma/client';

export type IBuildCreateCateringCompanyArgs = Pick<
  Prisma.CateringCompanyUncheckedCreateInput,
  'name' | 'ownerId'
>;

export interface IBuildRetrieveIntegrationListArgs {
  pg?: number;
  perPage?: number;
  templateSrcSystem?: 'ezCater';
  templateTargetSystem?: 'ezCater' | 'Nutshell';
}

export interface IBuildRetrieveCompanyIntegrationListArgs
  extends IBuildRetrieveIntegrationListArgs {
  isConfigured?: boolean;
  isActive?: boolean;
  createdSince?: Date;
  sort?: 'created_asc' | 'created_desc';
}
