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

  async createAccount(name: string, externalAuthUID: string): Promise<any> {
    return { name, externalAuthUID };
    // Create account
    // await this.accountDbHandler.createAccount(name);
    // // Create user (owner)
    // await this.userDbHandler.createUser();
    // Add user to Auth0

    // Create accountUser
    // Return success
  }
}
