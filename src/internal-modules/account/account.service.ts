import { Injectable } from '@nestjs/common';
import { IAccountService } from './interfaces/account.service.interface';
import { AccountDbHandlerService } from '../external-handlers/db-handlers/account-db-handler/account-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';

@Injectable()
export class AccountService implements IAccountService {
  constructor(
    private readonly accountDbHandler: AccountDbHandlerService,
    private readonly userDbHandler: UserDbHandlerService,
  ) {}

  async createAccount(name: string, ownerId: string): Promise<any> {
    const account = await this.accountDbHandler.createAccount(name, ownerId);
    await this.userDbHandler.updateUser(ownerId, { accountId: account.id });
    return;
  }
}
