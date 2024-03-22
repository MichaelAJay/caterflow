import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionDbQueryBuilderService } from './role-permission-db-query-builder.service';

describe('RolePermissionDbQueryBuilderService', () => {
  let service: RolePermissionDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolePermissionDbQueryBuilderService],
    }).compile();

    service = module.get<RolePermissionDbQueryBuilderService>(
      RolePermissionDbQueryBuilderService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
