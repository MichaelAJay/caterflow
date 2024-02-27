import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDbHandlerModule } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.module';

@Module({
  imports: [UserDbHandlerModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
