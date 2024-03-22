import { Inject, Injectable } from '@nestjs/common';
import { ICacheService } from './interfaces/cache.service.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LogService } from '../log/log.service';

@Injectable()
export class CacheService implements ICacheService {
  defaultTTLInMS: number;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logService: LogService,
  ) {
    this.defaultTTLInMS = 12000000;
  }
  async get<T>(key: string): Promise<T | null> {
    const start = Date.now();
    try {
      const record = await this.cacheManager.get(key);

      const logMsg = !!record ? 'Cache hit' : 'Cache miss';
      this.logService.debug(logMsg, { key });

      return (record as T) || null;
    } catch (err) {
      this.logService.error('Failed to retrieve from cache', err.stack, {
        key,
      });
      return null;
    } finally {
      this.logService.debug('Cache get execution time', {
        key,
        duration: Date.now() - start,
      });
    }
  }
  async set(key: string, value: any, ttlArg?: number): Promise<boolean> {
    const ttl = ttlArg || this.defaultTTLInMS;
    try {
      await this.cacheManager.set(key, value, ttl);

      this.logService.debug('Cache set', { key, ttl });
      return true;
    } catch (err) {
      this.logService.error('Failed to set cache', err.stack, { key, ttl });
      return false;
    }
  }
}
