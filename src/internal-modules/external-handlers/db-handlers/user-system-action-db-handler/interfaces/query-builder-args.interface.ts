import { Prisma } from '@prisma/client';

export type IBuildCreateUserSystemActionArgs = Pick<
  Prisma.UserSystemActionUncheckedCreateInput,
  'userId' | 'companyId' | 'action' | 'details' | 'result'
>;
