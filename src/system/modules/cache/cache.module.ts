import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { LogModule } from '../log/log.module';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [CacheModule.register(), LogModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class InternalCacheModule {}
