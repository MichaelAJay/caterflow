import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsMapperService } from './integrations-mapper.service';

describe('IntegrationsMapperService', () => {
  let service: IntegrationsMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntegrationsMapperService],
    }).compile();

    service = module.get<IntegrationsMapperService>(IntegrationsMapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
