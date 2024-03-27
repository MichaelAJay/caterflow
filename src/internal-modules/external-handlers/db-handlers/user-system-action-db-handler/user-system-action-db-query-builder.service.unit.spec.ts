import { Test, TestingModule } from '@nestjs/testing';
import { UserSystemActionDbQueryBuilderService } from './user-system-action-db-query-builder.service';
import { Prisma } from '@prisma/client';

describe('UserSystemActionDbQueryBuilderService', () => {
  let service: UserSystemActionDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSystemActionDbQueryBuilderService],
    }).compile();

    service = module.get<UserSystemActionDbQueryBuilderService>(
      UserSystemActionDbQueryBuilderService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildCreateUserSystemActionQuery', () => {
    it('should return a valid query object', () => {
      const input: Prisma.UserSystemActionUncheckedCreateInput = {
        userId: '123',
        action: 'AddIntegration',
        details: 'testDetails',
      };
      const expectedQuery: Prisma.UserSystemActionCreateArgs = {
        data: input,
      };

      const result = service.buildCreateUserSystemActionQuery(input);

      expect(result).toEqual(expectedQuery);
    });
  });
  describe('buildRetrieveUniqueUserSystemActionQuery', () => {
    it('should return a valid query object', () => {
      const id = '123';
      const expectedQuery: Prisma.UserSystemActionFindUniqueArgs = {
        include: {
          user: {
            select: {
              nameEncrypted: true,
            },
          },
        },
        where: {
          id,
        },
      };

      const result = service.buildRetrieveUniqueUserSystemActionQuery(id);

      expect(result).toEqual(expectedQuery);
    });
  });
});
