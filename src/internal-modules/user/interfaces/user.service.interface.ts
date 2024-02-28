import { User } from '@prisma/client';
import { IBuildUpdateUserArgs } from 'src/internal-modules/external-handlers/db-handlers/user-db-handler/interfaces/query-builder-args.interfaces';

export interface IUserService {
  createUser(name: string, email: string, extAuthUID: string): Promise<any>;
  updateUser(id: string, updates: IBuildUpdateUserArgs): Promise<any>;
  getUserByExternalUID(externalUID: string): Promise<User | null>;
}
