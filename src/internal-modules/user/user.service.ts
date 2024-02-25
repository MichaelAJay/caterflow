import { Injectable } from '@nestjs/common';
import { IUserService } from './interfaces/user.service.interface';
import { User } from '@prisma/client';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userDbHandler: UserDbHandlerService) {}

  async getUserByExternalUID(externalUID: string): Promise<User | null> {
    const user =
      await this.userDbHandler.retrieveUserByExternalAuthUID(externalUID);
    return user;
  }
}
