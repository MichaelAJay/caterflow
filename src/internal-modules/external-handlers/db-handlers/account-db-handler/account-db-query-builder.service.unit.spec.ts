import { Test, TestingModule } from '@nestjs/testing';
import { AccountDbQueryBuilderService } from './account-db-query-builder.service';

describe('AccountDbQueryBuilderService', () => {
  let service: AccountDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountDbQueryBuilderService],
    }).compile();

    service = module.get<AccountDbQueryBuilderService>(
      AccountDbQueryBuilderService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an object with data set to the input', () => {
    const input = { name: 'Test Account', ownerId: 'testOwnerId' };
    const expectedOutput = { data: input };

    const result = service.buildCreateAccountQuery(input);

    expect(result).toEqual(expectedOutput);
  });
});
