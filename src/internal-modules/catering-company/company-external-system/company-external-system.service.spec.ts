import { Test, TestingModule } from '@nestjs/testing';
import { CompanyExternalSystemService } from './company-external-system.service';

describe('CompanyExternalSystemService', () => {
  let service: CompanyExternalSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyExternalSystemService],
    }).compile();

    service = module.get<CompanyExternalSystemService>(CompanyExternalSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
