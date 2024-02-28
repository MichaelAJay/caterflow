import { User } from '@prisma/client';

export interface IUserService {
  createUser(name: string, email: string, extAuthUID: string): Promise<any>;
  getUserByExternalUID(externalUID: string): Promise<User | null>;
}
