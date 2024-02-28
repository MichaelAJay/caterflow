import { Injectable } from '@nestjs/common';
import { IUserService } from './interfaces/user.service.interface';
import { User } from '@prisma/client';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CryptoService } from 'src/system/modules/crypto/crypto.service';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userDbHandler: UserDbHandlerService,
    private readonly cryptoService: CryptoService,
  ) {}

  async createUser(email: string, externalAuthUID: string): Promise<any> {
    // throw new Error('Method not implemented.');

    return { email, externalAuthUID };
  }

  async getUserByExternalUID(externalUID: string): Promise<User | null> {
    const user =
      await this.userDbHandler.retrieveUserByExternalAuthUID(externalUID);
    return user;
  }
}
