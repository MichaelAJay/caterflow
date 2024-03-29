import { Test, TestingModule } from '@nestjs/testing';
import { UserDbQueryBuilderService } from './user-db-query-builder.service.unit';

describe('UserDbQueryBuilderService', () => {
  let service: UserDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDbQueryBuilderService],
    }).compile();

    service = module.get<UserDbQueryBuilderService>(UserDbQueryBuilderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildFindUniqueUserWhereClause', () => {
    it('should return an object with where set to the input', () => {
      const input = { extAuthUID: 'testExtAuthUID' };
      const expectedOutput = { where: input };

      const result = service.buildRetrieveUniqueUserQuery(input);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('buildUpdateUser', () => {
    it('should return an object with where.id set to the id and data set to the updates', () => {
      const id = '1';
      const updates = { companyId: 'companyId' };
      const expectedOutput = { where: { id }, data: updates };

      const result = service.buildUpdateUser(id, updates);

      expect(result).toEqual(expectedOutput);
    });
  });
});
