import { Test, TestingModule } from '@nestjs/testing';
import { CustomConfigService } from './custom-config.service';
import { ConfigService } from '@nestjs/config';

describe('CustomConfigService', () => {
  let service: CustomConfigService;
  let mockConfigService = { get: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomConfigService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CustomConfigService>(CustomConfigService);
    mockConfigService = module.get<{ get: jest.Mock }>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEnvVariable', () => {
    it('should return the environment variable if found', () => {
      const key = 'TEST_KEY';
      const value = 'TEST_VALUE';
      mockConfigService.get.mockReturnValue(value);

      const result = service.getEnvVariable<string>(key);
      expect(result).toBe(value);
      expect(mockConfigService.get).toHaveBeenCalledWith(key);
    });
    it('should return the default value if environment variable not found and default included', () => {
      const key = 'TEST_KEY';
      const defaultValue = 'DEFAULT_VALUE';
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.getEnvVariable<string>(key, defaultValue);
      expect(result).toBe(defaultValue);
    });
    it('should return any default value if environment variable not found and default is falsy', () => {
      const key = 'TEST_KEY';
      const defaultValue = '';
      mockConfigService.get.mockReturnValue(undefined);

      const result = service.getEnvVariable<string>(key, defaultValue);
      expect(result).toBe(defaultValue);
    });
    it('should return values of the correct type if not strings, even if falsy', () => {
      const key = 'TEST_KEY';
      const value = 0;
      mockConfigService.get.mockReturnValue(value);

      const result = service.getEnvVariable<number>(key);
      expect(result).toBe(value);
    });
    it('should throw an error if environment variable not found and default not included', () => {
      const key = 'TEST_KEY';
      mockConfigService.get.mockReturnValue(undefined);

      expect(() => service.getEnvVariable<string>(key)).toThrow(
        `Environment variable ${key} is not defined`,
      );
    });
  });
});
