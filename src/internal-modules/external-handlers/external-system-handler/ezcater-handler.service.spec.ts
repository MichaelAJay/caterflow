import { Test, TestingModule } from '@nestjs/testing';
import { EzcaterHandlerService } from './ezcater-handler.service';

describe('EzcaterHandlerService', () => {
  let service: EzcaterHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EzcaterHandlerService],
    }).compile();

    service = module.get<EzcaterHandlerService>(EzcaterHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
