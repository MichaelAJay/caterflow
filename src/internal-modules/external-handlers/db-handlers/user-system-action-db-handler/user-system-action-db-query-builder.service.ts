import { Injectable } from '@nestjs/common';
import { IUserSystemActionDbQueryBuilder } from './interfaces/user-system-action-db-query-builder.service.interface';
import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { IBuildCreateUserSystemActionArgs } from './interfaces/query-builder-args.interface';

@Injectable()
export class UserSystemActionDbQueryBuilderService
  implements IUserSystemActionDbQueryBuilder
{
  buildCreateUserSystemActionQuery(
    input: IBuildCreateUserSystemActionArgs,
  ): Prisma.UserSystemActionCreateArgs<DefaultArgs> {
    const query: Prisma.UserSystemActionCreateArgs = { data: input };
    return query;
  }
  buildCreateManyUserSystemActionsQuery(
    input: IBuildCreateUserSystemActionArgs[],
  ): Prisma.UserSystemActionCreateManyArgs<DefaultArgs> {
    const query: Prisma.UserSystemActionCreateManyArgs = { data: input };
    return query;
  }
  buildRetrieveUniqueUserSystemActionQuery(
    id: string,
  ): Prisma.UserSystemActionFindUniqueArgs<DefaultArgs> {
    const query: Prisma.UserSystemActionFindUniqueArgs = {
      include: {
        user: {
          select: {
            nameEncrypted: true,
          },
        },
      },
      where: {
        id,
      },
    };
    return query;
  }
  /**
   * @TODO requires pagination
   */
  buildRetrieveManyUserSystemActionsQuery(): Prisma.UserSystemActionFindManyArgs<DefaultArgs> {
    throw new Error('Method not implemented.');
  }
}
