import { Prisma } from '@prisma/client';

export type IBuildCreateUserArgs = Pick<
  Prisma.UserUncheckedCreateInput,
  | 'extAuthUID'
  | 'accountId'
  | 'emailEncrypted'
  | 'emailHashed'
  | 'nameEncrypted'
>;

export type IBuildUpdateUserArgs = Pick<
  Prisma.UserUncheckedUpdateInput,
  'accountId'
>;
