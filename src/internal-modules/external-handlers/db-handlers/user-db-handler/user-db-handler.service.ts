import { ConflictException, Injectable } from '@nestjs/common';
import { IUserDbHandler } from './interfaces/user-db-handler.service.interface';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { UserDbQueryBuilderService } from './user-db-query-builder.service.unit';
import {
  IBuildCreateUserArgs,
  IBuildUpdateUserArgs,
} from './interfaces/query-builder-args.interfaces';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ERROR_CODE } from '../../../../common/codes/error-codes';

@Injectable()
export class UserDbHandlerService implements IUserDbHandler {
  constructor(
    private readonly prismaClient: PrismaClientService,
    private readonly userQueryBuilder: UserDbQueryBuilderService,
  ) {}

  async createUser(input: IBuildCreateUserArgs): Promise<User> {
    try {
      const result = await this.prismaClient.user.create(
        this.userQueryBuilder.buildCreateUserQuery(input),
      );
      return result;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if ((err.code = 'P2002')) {
          throw new ConflictException({
            message:
              'Your request could not be completed at this time. If you believe something is wrong on our end, please contact support for assistance.',
            code: ERROR_CODE.Conflict,
          });
        }
      }
      throw err;
    }
  }

  async retrieveUserByExternalAuthUID(externalAuthUID: string): Promise<any> {
    const result = await this.prismaClient.user.findUnique(
      this.userQueryBuilder.buildFindUniqueUserWhereClause({
        extAuthUID: externalAuthUID,
      }),
    );
    return result;
  }

  async updateUser(id: string, updates: IBuildUpdateUserArgs) {
    const result = await this.prismaClient.user.update(
      this.userQueryBuilder.buildUpdateUser(id, updates),
    );
    return result;
  }
}
