import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';

describe('CompanyRoleAndPermissionDbQueryBuilderService', () => {
  let service: CompanyRoleAndPermissionDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyRoleAndPermissionDbQueryBuilderService],
    }).compile();

    service = module.get<CompanyRoleAndPermissionDbQueryBuilderService>(CompanyRoleAndPermissionDbQueryBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
