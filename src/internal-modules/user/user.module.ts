import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDbHandlerModule } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.module';
import { CryptoModule } from 'src/system/modules/crypto/crypto.module';
import { DataAccessModule } from '../external-handlers/data-access/data-access.module';

@Module({
  imports: [UserDbHandlerModule, CryptoModule, DataAccessModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
