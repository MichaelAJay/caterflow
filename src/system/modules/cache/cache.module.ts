import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { LogModule } from '../log/log.module';

@Global()
@Module({
  imports: [LogModule],
  providers: [CacheService],
  exports: [CacheService],
})
export class InternalCacheModule {}
