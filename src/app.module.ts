import { Module } from '@nestjs/common';
import { UserApiModule } from './api/user/user-api.module';
import { CateringCompanyApiModule } from './api/catering-company/catering-company-api.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth/auth.guard';
import { AppController } from './app.controller';
import { UserModule } from './internal-modules/user/user.module';
import { GuardModule } from './common/guards/guard/guard.module';
// import { CacheModule } from '@nestjs/cache-manager';
import { LogModule } from './system/modules/log/log.module';
import { InternalCacheModule } from './system/modules/cache/cache.module';
import { LoggingInterceptor } from './common/interceptors/logging/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions/all-exceptions.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    LogModule,
    // CacheModule.register({
    //   isGlobal: true,
    // }),
    InternalCacheModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
