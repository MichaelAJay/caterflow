import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountDbHandlerModule } from '../external-handlers/db-handlers/account-db-handler/account-db-handler.module';
import { UserDbHandlerModule } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.module';

@Module({
  imports: [AccountDbHandlerModule, UserDbHandlerModule],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
