import { Test, TestingModule } from '@nestjs/testing';
import { UserSystemActionDbQueryBuilderService } from './user-system-action-db-query-builder.service';

describe('UserSystemActionDbQueryBuilderService', () => {
  let service: UserSystemActionDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSystemActionDbQueryBuilderService],
    }).compile();

    service = module.get<UserSystemActionDbQueryBuilderService>(UserSystemActionDbQueryBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
