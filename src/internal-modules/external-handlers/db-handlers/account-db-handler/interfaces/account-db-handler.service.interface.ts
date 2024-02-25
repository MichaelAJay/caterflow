import { Account } from '@prisma/client';

export interface IAccountDbHandler {
  createAccount(name: string, ownerId: string): Promise<Account>;
}
