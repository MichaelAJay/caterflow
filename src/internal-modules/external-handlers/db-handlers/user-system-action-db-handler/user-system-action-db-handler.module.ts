import { Module } from '@nestjs/common';
import { UserSystemActionDbHandlerService } from './user-system-action-db-handler.service';
import { UserSystemActionDbQueryBuilderService } from './user-system-action-db-query-builder.service';
import { PrismaClientService } from 'src/external-modules/prisma-client/prisma-client.service';

@Module({
  imports: [PrismaClientService],
  providers: [
    UserSystemActionDbHandlerService,
    UserSystemActionDbQueryBuilderService,
  ],
  exports: [UserSystemActionDbHandlerService],
})
export class UserSystemActionDbHandlerModule {}
