import { Test, TestingModule } from '@nestjs/testing';
import { NoAssetsHandlerService } from './no-assets-handler.service';

describe('NoAssetsHandlerService', () => {
  let service: NoAssetsHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoAssetsHandlerService],
    }).compile();

    service = module.get<NoAssetsHandlerService>(NoAssetsHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
