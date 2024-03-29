import { Prisma } from '@prisma/client';
import { IBuildCreateUserSystemActionArgs } from './query-builder-args.interface';

export interface IUserSystemActionDbQueryBuilder {
  buildCreateUserSystemActionQuery(
    input: IBuildCreateUserSystemActionArgs,
  ): Prisma.UserSystemActionCreateArgs;
  buildCreateManyUserSystemActionsQuery(
    input: IBuildCreateUserSystemActionArgs[],
  ): Prisma.UserSystemActionCreateManyArgs;
  buildRetrieveUniqueUserSystemActionQuery(
    id: string,
  ): Prisma.UserSystemActionFindUniqueArgs;
  buildRetrieveManyUserSystemActionsQuery(): Prisma.UserSystemActionFindManyArgs;
}
