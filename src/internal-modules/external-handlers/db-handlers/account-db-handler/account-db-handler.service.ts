import { Injectable } from '@nestjs/common';
import { IAccountDbHandler } from './interfaces/account-db-handler.service.interface';
import { AccountDbQueryBuilderService } from './account-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { Account } from '@prisma/client';

@Injectable()
export class AccountDbHandlerService implements IAccountDbHandler {
  constructor(
    private readonly accountDbQueryBuilder: AccountDbQueryBuilderService,
    private readonly prismaClient: PrismaClientService,
  ) {}

  async createAccount(name: string, ownerId: string): Promise<Account> {
    // Take care of known errors here
    const account = await this.prismaClient.account.create(
      this.accountDbQueryBuilder.buildCreateAccountQuery({ name, ownerId }),
    );
    return account;
  }
}
