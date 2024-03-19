import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyDbQueryBuilderService } from './catering-company-db-query-builder.service';

describe('CateringCompanyDbQueryBuilderService', () => {
  let service: CateringCompanyDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CateringCompanyDbQueryBuilderService],
    }).compile();

    service = module.get<CateringCompanyDbQueryBuilderService>(
      CateringCompanyDbQueryBuilderService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an object with data set to the input', () => {
    const input = { name: 'Test CateringCompany', ownerId: 'testOwnerId' };
    const expectedOutput = { data: input };

    const result = service.buildCreateCateringCompanyQuery(input);

    expect(result).toEqual(expectedOutput);
  });
});
