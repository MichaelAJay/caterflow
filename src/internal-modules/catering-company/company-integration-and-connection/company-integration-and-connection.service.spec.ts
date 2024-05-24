import { Test, TestingModule } from '@nestjs/testing';
import { CompanyIntegrationAndConnectionService } from './company-integration-and-connection.service';

describe('CompanyIntegrationAndConnectionService', () => {
  let service: CompanyIntegrationAndConnectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyIntegrationAndConnectionService],
    }).compile();

    service = module.get<CompanyIntegrationAndConnectionService>(CompanyIntegrationAndConnectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
