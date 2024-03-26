import { Prisma } from '@prisma/client';

export interface IUserSystemActionDbQueryBuilder {
  buildCreateUserSystemActionQuery(
    input: Pick<
      Prisma.UserSystemActionUncheckedCreateInput,
      'userId' | 'action' | 'details'
    >,
  ): Prisma.UserSystemActionCreateArgs;
  buildRetrieveUniqueUserSystemActionQuery(
    id: string,
  ): Prisma.UserSystemActionFindUniqueArgs;
  buildRetrieveManyUserSystemActionsQuery(): Prisma.UserSystemActionFindManyArgs;
}
