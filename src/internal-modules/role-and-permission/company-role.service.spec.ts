import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleService } from './company-role.service';

describe('CompanyRoleService', () => {
  let service: CompanyRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyRoleService],
    }).compile();

    service = module.get<CompanyRoleService>(CompanyRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
