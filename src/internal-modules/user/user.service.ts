import { Injectable } from '@nestjs/common';
import { IUserService } from './interfaces/user.service.interface';
import { User } from '@prisma/client';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CryptoService } from '../../system/modules/crypto/crypto.service';
import { IBuildUpdateUserArgs } from '../external-handlers/db-handlers/user-db-handler/interfaces/query-builder-args.interfaces';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userDbHandler: UserDbHandlerService,
    private readonly cryptoService: CryptoService,
  ) {}

  async createUser(
    name: string,
    email: string,
    extAuthUID: string,
  ): Promise<void> {
    const encryptedNamePromise = this.cryptoService.encrypt(name);
    const encryptedEmailPromise = this.cryptoService.encrypt(email);
    const hashedEmailPromise = this.cryptoService.hash(email);
    const [nameEncrypted, emailEncrypted, emailHashed] = await Promise.all([
      encryptedNamePromise,
      encryptedEmailPromise,
      hashedEmailPromise,
    ]);
    await this.userDbHandler.createUser({
      extAuthUID,
      emailEncrypted,
      emailHashed,
      nameEncrypted,
    });
  }

  async updateUser(id: string, updates: IBuildUpdateUserArgs) {
    await this.userDbHandler.updateUser(id, updates);
    return;
  }

  async getUserByExternalUID(externalUID: string): Promise<User | null> {
    const user =
      await this.userDbHandler.retrieveUserByExternalAuthUID(externalUID);
    return user;
  }
}
