import { Injectable } from '@nestjs/common';
import { IUserDbHandler } from './interfaces/user-db-handler.service.interface';
import { PrismaClientService } from 'src/external-modules/prisma-client/prisma-client.service';
import { UserDbQueryBuilderService } from './user-db-query-builder.service';
import {
  IBuildCreateUserArgs,
  IBuildUpdateUserArgs,
} from './interfaces/query-builder-args.interfaces';
import { User } from '@prisma/client';

@Injectable()
export class UserDbHandlerService implements IUserDbHandler {
  constructor(
    private readonly prismaClient: PrismaClientService,
    private readonly userQueryBuilder: UserDbQueryBuilderService,
  ) {}

  async createUser(input: IBuildCreateUserArgs): Promise<User> {
    const result = await this.prismaClient.user.create(
      this.userQueryBuilder.buildCreateUserQuery(input),
    );
    return result;
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
