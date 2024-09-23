import { Test, TestingModule } from '@nestjs/testing';
import { NoOutboundHandlerService } from './no-outbound-handler.service';

describe('NoOutboundHandlerService', () => {
  let service: NoOutboundHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoOutboundHandlerService],
    }).compile();

    service = module.get<NoOutboundHandlerService>(NoOutboundHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
