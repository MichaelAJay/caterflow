import { Injectable } from '@nestjs/common';
import { PrismaClientService } from 'src/external-modules/prisma-client/prisma-client.service';

@Injectable()
export class AuthService {
  constructor(private readonly dbClient: PrismaClientService) {}
}
