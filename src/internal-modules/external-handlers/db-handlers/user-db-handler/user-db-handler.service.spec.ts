import { Test, TestingModule } from '@nestjs/testing';
import { UserDbHandlerService } from './user-db-handler.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { UserDbQueryBuilderService } from './user-db-query-builder.service';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { mockUserDbQueryBuilderService } from '../../../../../test/mocks/providers/mock_user_db_querybuilder';

describe('UserDbHandlerService', () => {
  let service: UserDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDbHandlerService,
        { provide: PrismaClientService, useValue: mockPrismaClientService },
        {
          provide: UserDbQueryBuilderService,
          useValue: mockUserDbQueryBuilderService,
        },
      ],
    }).compile();

    service = module.get<UserDbHandlerService>(UserDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
