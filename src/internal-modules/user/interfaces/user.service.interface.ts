import { User } from '@prisma/client';

export interface IUserService {
  getUserByExternalUID(externalUID: string): Promise<User | null>;
}
