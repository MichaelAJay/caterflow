import { Test, TestingModule } from '@nestjs/testing';
import { EzCaterHandlerService } from './ezcater-handler.service';

describe('EzcaterHandlerService', () => {
  let service: EzCaterHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EzCaterHandlerService],
    }).compile();

    service = module.get<EzCaterHandlerService>(EzCaterHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
