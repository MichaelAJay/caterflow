import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('CacheService', () => {
  let cacheService: CacheService;
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(cacheService).toBeDefined();
  });

  describe('get', () => {
    it('should return a cached item', async () => {
      const existingKey = 'existingKey';
      const existingValue = { data: 'testData' };
      cacheManager.get.mockResolvedValue(existingValue);
      const result = await cacheService.get<typeof existingValue>(existingKey);
      expect(result).toEqual(existingValue);
      expect(cacheManager.get).toHaveBeenCalledWith(existingKey);
    });
    it('should return null for a non-existing key', async () => {
      cacheManager.get.mockResolvedValue(null);
      const result = await cacheService.get('nonExistingKey');
      expect(result).toBeNull();
    });
    it('should handle cache service errors gracefully', async () => {
      cacheManager.get.mockRejectedValue(new Error('Cache error'));
      const result = await cacheService.get('erroredKey');
      expect(result).toBeNull();
    });
  });
  describe('set', () => {
    it('should successfully set a value with custom TTL', async () => {
      const key = 'key';
      const value = 'testValue';
      const ttl = 5000;
      cacheManager.set.mockResolvedValue(true);
      const result = await cacheService.set(key, value, ttl);
      expect(result).toBe(true);
      expect(cacheManager.set).toHaveBeenCalledWith(key, value, ttl);
    });
    it("should default to the service's default TTL if not provided", async () => {
      const key = 'key';
      const value = 'testValue';
      const defaultTTL = 12000000;
      cacheManager.set.mockResolvedValue(true);
      await cacheService.set(key, value);
      expect(cacheManager.set).toHaveBeenCalledWith(key, value, defaultTTL);
    });
    it('should return false if cache manager fails to set the value', async () => {
      cacheManager.set.mockRejectedValue(new Error('Set operation failed'));
      const result = await cacheService.set('key', 'value');
      expect(result).toBe(false);
    });
    it('should handle array values', async () => {
      const key = 'key';
      const value = ['testValue'];
      const defaultTTL = 12000000;
      cacheManager.set.mockResolvedValue(true);
      await cacheService.set(key, value);
      expect(cacheManager.set).toHaveBeenCalledWith(key, value, defaultTTL);
    });
    it('should handle object values', async () => {
      const key = 'key';
      const value = { key: 'testValue' };
      const defaultTTL = 12000000;
      cacheManager.set.mockResolvedValue(true);
      await cacheService.set(key, value);
      expect(cacheManager.set).toHaveBeenCalledWith(key, value, defaultTTL);
    });
    it('should handle number values', async () => {
      const key = 'key';
      const value = 8675309;
      const defaultTTL = 12000000;
      cacheManager.set.mockResolvedValue(true);
      await cacheService.set(key, value);
      expect(cacheManager.set).toHaveBeenCalledWith(key, value, defaultTTL);
    });
  });
});
