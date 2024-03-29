import { ICacheService } from 'src/system/modules/cache/interfaces/cache.service.interface';

export const mockCacheService: ICacheService = {
  get: jest.fn(),
  set: jest.fn(),
};
