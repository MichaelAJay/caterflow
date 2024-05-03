import { Test, TestingModule } from '@nestjs/testing';
import { EzCaterApiService } from './ezcater-api.service';

describe('EzcaterApiService', () => {
  let service: EzCaterApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EzCaterApiService],
    }).compile();

    service = module.get<EzCaterApiService>(EzCaterApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
