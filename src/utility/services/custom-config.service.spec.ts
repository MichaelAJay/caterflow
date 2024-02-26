import { Test, TestingModule } from '@nestjs/testing';
import { CustomConfigService } from './custom-config.service';
import { ConfigService } from '@nestjs/config';

describe('CustomConfigService', () => {
  let service: CustomConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomConfigService,
        { provide: ConfigService, useValue: { get: jest.fn } },
      ],
    }).compile();

    service = module.get<CustomConfigService>(CustomConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
