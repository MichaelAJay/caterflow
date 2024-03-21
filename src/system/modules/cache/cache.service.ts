import { Inject, Injectable } from '@nestjs/common';
import { ICacheService } from './interfaces/cache.service.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService implements ICacheService {
  defaultTTLInMS: number;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.defaultTTLInMS = 12000000;
  }
  async get<T>(key: string): Promise<T | null> {
    try {
      const record = await this.cacheManager.get(key);
      return record as T;
    } catch (err) {
      return null;
    }
  }
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      await this.cacheManager.set(key, value, ttl || this.defaultTTLInMS);
      return true;
    } catch (err) {
      return false;
    }
  }
}
