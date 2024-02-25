import { Test, TestingModule } from '@nestjs/testing';
import { AccountDbQueryBuilderService } from './account-db-query-builder.service';

describe('AccountDbQueryBuilderService', () => {
  let service: AccountDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountDbQueryBuilderService],
    }).compile();

    service = module.get<AccountDbQueryBuilderService>(AccountDbQueryBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
