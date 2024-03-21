import { Module } from '@nestjs/common';
import { UserApiModule } from './api/user/user-api.module';
import { CateringCompanyApiModule } from './api/catering-company/catering-company-api.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth/auth.guard';
import { AppController } from './app.controller';
import { UserModule } from './internal-modules/user/user.module';
import { GuardModule } from './common/guards/guard/guard.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    CacheModule.register({
      isGlobal: true,
    }),
    CateringCompanyApiModule,
    UserApiModule,
    UserModule,
    GuardModule,
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
