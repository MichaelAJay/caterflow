import { User } from '@prisma/client';

export interface IUserService {
  createUser(email: string, externalAuthUID: string): Promise<any>;
  getUserByExternalUID(externalUID: string): Promise<User | null>;
}
