import { Prisma } from '@prisma/client';

export type IBuildCreateUserArgs = Pick<
  Prisma.UserUncheckedCreateInput,
  | 'extAuthUID'
  | 'companyId'
  | 'emailEncrypted'
  | 'emailHashed'
  | 'nameEncrypted'
  | 'emailVerified'
>;

export type IBuildUpdateUserArgs = Pick<
  Prisma.UserUncheckedUpdateInput,
  'companyId' | 'emailVerified'
>;
