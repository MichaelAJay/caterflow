import { Injectable } from '@nestjs/common';
import { IUserDbHandler } from './interfaces/user-db-handler.service.interface';
import { PrismaClientService } from 'src/external-modules/prisma-client/prisma-client.service';

@Injectable()
export class UserDbHandlerService implements IUserDbHandler {
  constructor(private readonly prismaClient: PrismaClientService) {}

  async createUser(): Promise<any> {
    throw new Error('Method not implemented.');
  }

  async retrieveUserByExternalAuthUID(externalAuthUID: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
