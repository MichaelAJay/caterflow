import { Module } from '@nestjs/common';
import { UserApiModule } from './api/user/user-api.module';
import { AccountApiModule } from './api/account/account-api.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    AccountApiModule,
    UserApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
