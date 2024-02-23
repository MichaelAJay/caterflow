import { Injectable } from '@nestjs/common';
import { IUserService } from './interfaces/user.service.interface';

@Injectable()
export class UserService implements IUserService {
  async getAccountByExternalUID(
    externalUID: string,
  ): Promise<{ id: string } | null> {
    console.log(externalUID);
    // Ultimately, this method should rely on cache
    // To begin with, just try to grab it by external UID
    // That would be User JOIN AccountUser would be sufficient
    return null;
  }
}
