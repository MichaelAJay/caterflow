import { Prisma } from '@prisma/client';

export type IBuildCreateAccountArgs = Pick<
  Prisma.AccountUncheckedCreateInput,
  'name' | 'ownerId'
>;
