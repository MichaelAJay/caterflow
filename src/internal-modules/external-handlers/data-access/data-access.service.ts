import { Injectable } from '@nestjs/common';
import { IDataAccessService } from './interfaces/data-access.service.interface';
import { CacheService } from 'src/system/modules/cache/cache.service';

@Injectable()
export class DataAccessService<T> implements IDataAccessService<T> {
  constructor(private readonly cacheService: CacheService) {}

  async get(key: string): Promise<T | null> {
    const res = await this.cacheService.get<T>(key);
    return res;
  }
  async set(key: string, value: T, ttl?: number | undefined): Promise<boolean> {
    const res = await this.cacheService.set(key, value, ttl);
    return res;
  }
  async retrieveAndCache(
    key: string,
    fetchFunction: () => Promise<T | null>,
    transformFunction: (data: T) => T = (data) => data, // Default to no-op
    ttl?: number | undefined,
  ): Promise<T | null> {
    let data = await this.get(key);
    if (!data) {
      data = await fetchFunction();
      if (data) {
        const transformedData = transformFunction(data);
        await this.set(key, transformedData, ttl);
        return transformedData;
      }
    }
    return data;
  }
}
