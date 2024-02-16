import { Module } from '@nestjs/common';
import { AuthApiModule } from './api/auth-api/auth-api.module';
import { UserApiModule } from './api/user-api/user-api.module';

@Module({
  imports: [AuthApiModule, UserApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
