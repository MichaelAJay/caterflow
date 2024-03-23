import { Test, TestingModule } from '@nestjs/testing';
import { DataAccessService } from './data-access.service';
import { CacheService } from '../../../system/modules/cache/cache.service';
import { mockCacheService } from '../../../../test/mocks/providers/mock_cache_service';

describe('DataAccessService', () => {
  let service: DataAccessService<any>;
  let cacheService: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataAccessService,
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<DataAccessService<any>>(DataAccessService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined with all of its injected dependencies', () => {
    expect(service).toBeDefined();
    expect(cacheService).toBeDefined();
  });

  describe('get', () => {
    it('calls cacheService.get with the correct arguments', async () => {
      const key = 'key';
      const res = { resKey: 'resValue' };
      const spy = jest.spyOn(cacheService, 'get').mockResolvedValue(res);
      await service.get(key);
      expect(spy).toHaveBeenCalledWith(key);
    });
    it('returns the result from cacheService.get', async () => {
      const key = 'key';
      const res = { resKey: 'resValue' };
      const spy = jest.spyOn(cacheService, 'get').mockResolvedValue(res);
      await service.get(key);
      expect(spy).toHaveBeenCalledWith(key);
    });
    it('throws any error thrown by cacheService.get', async () => {
      const mockErr = new Error('test error');
      jest.spyOn(cacheService, 'get').mockRejectedValue(mockErr);
      await expect(service.get('key')).rejects.toThrow(mockErr);
    });
  });
  describe('set', () => {
    it('calls cacheService.set with the correct arguments if ttl is included', async () => {
      const key = 'key';
      const value = { value: 'any' };
      const ttl = 10000;
      const spy = jest.spyOn(cacheService, 'set').mockResolvedValue(true);
      await service.set(key, value, ttl);
      expect(spy).toHaveBeenCalledWith(key, value, ttl);
    });
    it('calls cacheService.set with the correct arguments if ttl is not included', async () => {
      const key = 'key';
      const value = { value: 'any' };
      const spy = jest.spyOn(cacheService, 'set').mockResolvedValue(true);
      await service.set(key, value);
      expect(spy).toHaveBeenCalledWith(key, value, undefined);
    });
    it('returns the result from cacheService.set', async () => {
      const key = 'key';
      const value = { value: 'any' };
      const returnVal = true;
      jest.spyOn(cacheService, 'set').mockResolvedValue(returnVal);
      const result = await service.set(key, value);
      expect(result).toBe(true);
    });
    it('throws any error thrown by cacheService.set', async () => {
      const mockErr = new Error('mockErr');
      jest.spyOn(cacheService, 'set').mockRejectedValue(mockErr);
      await expect(service.set('key', 'val')).rejects.toThrow(mockErr);
    });
  });
  describe('retrieveAndCache', () => {
    const key = 'testKey';
    const testData = { sample: 'data' };
    const transformedData = { sample: 'transformedData' };
    const ttl = 3600; // 1 hour

    beforeEach(() => {
      // Mock the get and set methods of the service
      jest
        .spyOn(service, 'get')
        .mockImplementation(async (key: string) => null);
      jest
        .spyOn(service, 'set')
        .mockImplementation(
          async (key: string, value: any, ttl?: number) => true,
        );
    });

    it('should fetch, transform, cache, and return data if not cached', async () => {
      const fetchFunction = jest.fn().mockResolvedValue(testData);
      const transformFunction = jest.fn().mockReturnValue(transformedData);

      const result = await service.retrieveAndCache(
        key,
        fetchFunction,
        transformFunction,
        ttl,
      );

      expect(fetchFunction).toHaveBeenCalled();
      expect(transformFunction).toHaveBeenCalledWith(testData);
      expect(service.set).toHaveBeenCalledWith(key, transformedData, ttl);
      expect(result).toEqual(transformedData);
    });

    it('should return cached data without fetching or transforming if already cached', async () => {
      jest.spyOn(service, 'get').mockResolvedValueOnce(testData); // Mock cached data
      const fetchFunction = jest.fn();
      const transformFunction = jest.fn();

      const result = await service.retrieveAndCache(
        key,
        fetchFunction,
        transformFunction,
      );

      expect(fetchFunction).not.toHaveBeenCalled();
      expect(transformFunction).not.toHaveBeenCalled();
      expect(service.get).toHaveBeenCalledWith(key);
      expect(result).toEqual(testData);
    });

    it('should not cache data if fetchFunction returns null', async () => {
      const fetchFunction = jest.fn().mockResolvedValue(null);
      const transformFunction = jest.fn();

      const result = await service.retrieveAndCache(
        key,
        fetchFunction,
        transformFunction,
      );

      expect(fetchFunction).toHaveBeenCalled();
      expect(transformFunction).not.toHaveBeenCalled();
      expect(service.set).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should apply a default transform function if none is provided', async () => {
      const fetchFunction = jest.fn().mockResolvedValue(testData);

      const result = await service.retrieveAndCache(key, fetchFunction);

      expect(fetchFunction).toHaveBeenCalled();
      expect(service.set).toHaveBeenCalledWith(key, testData, undefined);
      expect(result).toEqual(testData);
    });

    it('should handle and propagate fetchFunction errors', async () => {
      const error = new Error('Fetch failed');
      const fetchFunction = jest.fn().mockRejectedValue(error);

      await expect(
        service.retrieveAndCache(key, fetchFunction),
      ).rejects.toThrow(error);
    });
  });
});
