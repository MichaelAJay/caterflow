import { Test, TestingModule } from '@nestjs/testing';
import { UserDbQueryBuilderService } from './user-db-query-builder.service';

describe('UserDbQueryBuilderService', () => {
  let service: UserDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDbQueryBuilderService],
    }).compile();

    service = module.get<UserDbQueryBuilderService>(UserDbQueryBuilderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
