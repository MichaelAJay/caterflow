import { Test, TestingModule } from '@nestjs/testing';
import { NutshellHandlerService } from './nutshell-handler.service';

describe('NutshellHandlerService', () => {
  let service: NutshellHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NutshellHandlerService],
    }).compile();

    service = module.get<NutshellHandlerService>(NutshellHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
