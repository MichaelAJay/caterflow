import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  IBuildCreateUserArgs,
  IBuildUpdateUserArgs,
} from './interfaces/query-builder-args.interfaces';
import { IUserDbQueryBuilder } from './interfaces/user-db-query-builder.service.interface';
import { DefaultArgs } from '@prisma/client/runtime/library';

@Injectable()
export class UserDbQueryBuilderService implements IUserDbQueryBuilder {
  buildCreateUserQuery(input: IBuildCreateUserArgs): Prisma.UserCreateArgs {
    return {
      data: input,
    };
  }

  buildRetrieveUniqueUserQuery(
    input: Prisma.UserWhereUniqueInput,
  ): Prisma.UserFindUniqueArgs {
    return {
      where: input,
    };
  }

  buildUpdateUser(
    id: string,
    data: IBuildUpdateUserArgs,
  ): Prisma.UserUpdateArgs<DefaultArgs> {
    return {
      where: { id },
      data,
    };
  }
}
