import { Module } from '@nestjs/common';
import { UserApiModule } from './api/user/user-api.module';
import { AccountApiModule } from './api/account/account-api.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth/auth.guard';
import { FirebaseAdminModule } from './external-modules/firebase-admin/firebase-admin.module';
import { AppController } from './app.controller';
import { UserModule } from './internal-modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    AccountApiModule,
    UserApiModule,
    FirebaseAdminModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
