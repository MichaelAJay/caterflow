import { Prisma } from '@prisma/client';

export interface IUserSystemActionDbHandler {
  create(
    input: Pick<
      Prisma.UserSystemActionUncheckedCreateInput,
      'userId' | 'action' | 'details'
    >,
  ): Promise<any>;
  retrieveOne(id: string): Promise<any>;
  retrieve(): Promise<any>;
}
