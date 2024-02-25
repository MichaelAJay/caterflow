import { Prisma } from '@prisma/client';
import { IBuildCreateAccountArgs } from './query-builder-args.interfaces';

export interface IAccountDbQueryBuilder {
  buildCreateAccountQuery(
    input: IBuildCreateAccountArgs,
  ): Prisma.AccountCreateArgs;
}
