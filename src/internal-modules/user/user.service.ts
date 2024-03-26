import { Injectable } from '@nestjs/common';
import { IUserService } from './interfaces/user.service.interface';
import { User } from '@prisma/client';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CryptoService } from '../../system/modules/crypto/crypto.service';
import { IBuildUpdateUserArgs } from '../external-handlers/db-handlers/user-db-handler/interfaces/query-builder-args.interfaces';
import { DataAccessService } from '../external-handlers/data-access/data-access.service';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private readonly userDbHandler: UserDbHandlerService,
    private readonly cryptoService: CryptoService,
    private readonly dataService: DataAccessService<any>,
  ) {}

  async createUser(
    name: string,
    email: string,
    extAuthUID: string,
    emailVerified = false,
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
      emailVerified,
    });
  }

  async updateUser(id: string, updates: IBuildUpdateUserArgs) {
    await this.userDbHandler.updateUser(id, updates);
    return;
  }

  async getUserByExternalUID(externalUID: string): Promise<User | null> {
    // const user =
    //   await this.userDbHandler.retrieveUserByExternalAuthUID(externalUID);
    // return user;
    const user = await this.dataService.retrieveAndCache(
      `user:${externalUID}`,
      () => this.userDbHandler.retrieveUserByExternalAuthUID(externalUID),
      (user) => ({
        id: user.id,
        name: user.name,
        email: user.email, // Assume we only want to cache these fields
      }),
      14400000, // ttl: 4 hrs
    );
    return user;
  }
}
