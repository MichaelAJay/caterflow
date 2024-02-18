import { Module } from '@nestjs/common';
import { UserDbHandlerService } from './user-db-handler.service';
import { UserDbQueryBuilderService } from './user-db-query-builder.service';
import { PrismaClientModule } from 'src/external-modules/prisma-client/prisma-client.module';

@Module({
  imports: [PrismaClientModule],
  providers: [UserDbHandlerService, UserDbQueryBuilderService],
  exports: [UserDbHandlerService],
})
export class UserDbHandlerModule {}
