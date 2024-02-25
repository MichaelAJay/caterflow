import { Prisma } from '@prisma/client';
import {
  IBuildCreateUserArgs,
  IBuildUpdateUserArgs,
} from './query-builder-args.interfaces';

export interface IUserDbQueryBuilder {
  buildCreateUserQuery(input: IBuildCreateUserArgs): Prisma.UserCreateArgs;
  buildFindUniqueUserWhereClause(
    input: Prisma.UserWhereUniqueInput,
  ): Prisma.UserFindUniqueArgs;
  buildUpdateUser(
    id: string,
    updates: IBuildUpdateUserArgs,
  ): Prisma.UserUpdateArgs;
}
