import { Injectable } from '@nestjs/common';
import { IAccountDbHandler } from './interfaces/account-db-handler.service.interface';
import { AccountDbQueryBuilderService } from './account-db-query-builder.service';
import { PrismaClientService } from 'src/external-modules/prisma-client/prisma-client.service';

@Injectable()
export class AccountDbHandlerService implements IAccountDbHandler {
  constructor(
    private readonly accountDbQueryBuilder: AccountDbQueryBuilderService,
    private readonly prismaClient: PrismaClientService,
  ) {}

  async createAccount(name: string, ownerEmail: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
