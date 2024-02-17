import { Module } from '@nestjs/common';
import { UserApiModule } from './api/user-api/user-api.module';
import { AccountApiModule } from './api/account-api/account-api.module';

@Module({
  imports: [AccountApiModule, UserApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
