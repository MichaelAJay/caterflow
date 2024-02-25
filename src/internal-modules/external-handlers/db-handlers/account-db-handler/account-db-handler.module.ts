import { Module } from '@nestjs/common';
import { AccountDbHandlerService } from './account-db-handler.service';
import { AccountDbQueryBuilderService } from './account-db-query-builder.service';
import { PrismaClientModule } from 'src/external-modules/prisma-client/prisma-client.module';

@Module({
  imports: [PrismaClientModule],
  providers: [AccountDbHandlerService, AccountDbQueryBuilderService],
  exports: [AccountDbHandlerService],
})
export class AccountDbHandlerModule {}
