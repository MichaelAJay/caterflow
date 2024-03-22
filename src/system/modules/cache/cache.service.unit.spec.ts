import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { LogService } from '../log/log.service';
import { mockLogService } from '../../../../test/mocks/providers/mock_log_service';

describe('CacheService', () => {
  let cacheService: CacheService;
  let cacheManager: { get: jest.Mock; set: jest.Mock };
  let logService: LogService;

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        { provide: CACHE_MANAGER, useValue: cacheManager },
        { provide: LogService, useValue: mockLogService },
      ],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
    logService = module.get<LogService>(LogService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    it('should log a cache hit on retrieving an existing item', async () => {
      const existingKey = 'existingKey';
      const existingValue = { data: 'testData' };
      cacheManager.get.mockResolvedValue(existingValue);

      await cacheService.get<typeof existingValue>(existingKey);

      expect(logService.debug).toHaveBeenCalledWith('Cache hit', {
        key: existingKey,
      });
      expect(logService.debug).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ key: existingKey }),
      );
    });
    it('should log a cache miss on not retrieving an existing item', async () => {
      cacheManager.get.mockResolvedValue(null);

      await cacheService.get('nonExistingKey');

      expect(logService.debug).toHaveBeenCalledWith('Cache miss', {
        key: 'nonExistingKey',
      });
      expect(logService.debug).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ key: 'nonExistingKey' }),
      );
    });
    it('should log a cache error on cacheManager.get error', async () => {
      const errorMessage = 'Cache error';
      cacheManager.get.mockRejectedValue(new Error(errorMessage));

      await cacheService.get('erroredKey');

      expect(logService.error).toHaveBeenCalledWith(
        'Failed to retrieve from cache',
        expect.any(String),
        {
          key: 'erroredKey',
        },
      );
    });
    /**
     * @TODO Sharpen up this test to handle actual case (where dynamic dates and subtraction is required)
     */
    it('should log the execution time for getting a cache item', async () => {
      const existingKey = 'existingKey';
      const existingValue = { data: 'testData' };
      cacheManager.get.mockResolvedValue(existingValue);

      await cacheService.get<typeof existingValue>(existingKey);

      expect(logService.debug).toHaveBeenCalledWith(
        'Cache get execution time',
        expect.objectContaining({
          key: existingKey,
          duration: expect.any(Number),
        }),
      );
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
    it('should log a successful set operation with custom TTL', async () => {
      const key = 'key';
      const value = 'testValue';
      const ttl = 5000;
      cacheManager.set.mockResolvedValue(true);

      await cacheService.set(key, value, ttl);

      expect(logService.debug).toHaveBeenCalledWith('Cache set', { key, ttl });
    });
    it("should log the set operation with the service's default TTL when not provided", async () => {
      const key = 'key';
      const value = 'testValue';
      const defaultTTL = 12000000; // Make sure this matches your service's default

      await cacheService.set(key, value);

      expect(logService.debug).toHaveBeenCalledWith('Cache set', {
        key,
        ttl: defaultTTL,
      });
    });
    it('should log an error if cache manager fails to set the value', async () => {
      cacheManager.set.mockRejectedValue(new Error('Set operation failed'));

      await cacheService.set('key', 'value');

      expect(logService.error).toHaveBeenCalledWith(
        'Failed to set cache',
        expect.any(String),
        { key: 'key', ttl: 12000000 },
      );
    });
    it('should not log the value during a set operation', async () => {
      const key = 'sensitiveKey';
      const sensitiveValue = 'sensitiveValue'; // This represents sensitive data that should not be logged
      const ttl = 5000;

      const debugSpy = jest.spyOn(logService, 'debug');
      const errorSpy = jest.spyOn(logService, 'error');

      await cacheService.set(key, sensitiveValue, ttl);

      expect(debugSpy).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: sensitiveValue }),
      );
      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: sensitiveValue }),
      );

      debugSpy.mock.calls.forEach((call) => {
        expect(JSON.stringify(call)).not.toContain(sensitiveValue);
      });
      errorSpy.mock.calls.forEach((call) => {
        expect(JSON.stringify(call)).not.toContain(sensitiveValue);
      });
    });
  });
});
