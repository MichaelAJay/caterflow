import { Injectable } from '@nestjs/common';
import { IAccountDbQueryBuilder } from './interfaces/account-db-query-builder.service.interface';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { IBuildCreateAccountArgs } from './interfaces/query-builder-args.interfaces';

@Injectable()
export class AccountDbQueryBuilderService implements IAccountDbQueryBuilder {
  buildCreateAccountQuery(
    input: IBuildCreateAccountArgs,
  ): Prisma.AccountCreateArgs<DefaultArgs> {
    return {
      data: input,
    };
  }
}
