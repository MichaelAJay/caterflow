import { Test, TestingModule } from '@nestjs/testing';
import { NoInboundHandlerService } from './no-inbound-handler.service';

describe('NoInboundHandlerService', () => {
  let service: NoInboundHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoInboundHandlerService],
    }).compile();

    service = module.get<NoInboundHandlerService>(NoInboundHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
