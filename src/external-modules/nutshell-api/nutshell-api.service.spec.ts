import { Test, TestingModule } from '@nestjs/testing';
import { NutshellApiService } from './nutshell-api.service';

describe('NutshellApiService', () => {
  let service: NutshellApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NutshellApiService],
    }).compile();

    service = module.get<NutshellApiService>(NutshellApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
