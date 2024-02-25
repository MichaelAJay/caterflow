import { User } from '@prisma/client';
import {
  IBuildCreateUserArgs,
  IBuildUpdateUserArgs,
} from './query-builder-args.interfaces';

export interface IUserDbHandler {
  /**
   * This method may only omit accountId when used in the 'Create User' API route
   */
  createUser(input: IBuildCreateUserArgs): Promise<User>;
  retrieveUserByExternalAuthUID(externalAuthUID: string): Promise<User>;
  updateUser(userId: string, updates: IBuildUpdateUserArgs): any;
}
