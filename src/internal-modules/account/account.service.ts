import { Injectable } from '@nestjs/common';
import { IAccountService } from './interfaces/account.service.interface';

@Injectable()
export class AccountService implements IAccountService {
  constructor() {}

  async createAccount(
    name: string,
    owner: string,
    email: string,
    password: string,
  ): Promise<any> {
    // Create account
    // Create user (owner)
    // Add user to Auth0
    // Create accountUser
    // Return success
  }
}
