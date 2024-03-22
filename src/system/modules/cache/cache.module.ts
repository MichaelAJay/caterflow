import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [CacheModule.register()],
  providers: [CacheService],
  exports: [CacheService],
})
export class InternalCacheModule {}
