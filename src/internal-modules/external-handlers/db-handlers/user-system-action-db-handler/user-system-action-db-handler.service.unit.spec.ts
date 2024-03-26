import { Test, TestingModule } from '@nestjs/testing';
import { UserSystemActionDbHandlerService } from './user-system-action-db-handler.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { UserSystemActionDbQueryBuilderService } from './user-system-action-db-query-builder.service';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { mockUserSystemActionDbQueryBuilder } from '../../../../../test/mocks/providers/mock_user_system_action_db_querybuilder';

describe('UserSystemActionDbHandlerService', () => {
  let service: UserSystemActionDbHandlerService;
  let prismaClient: PrismaClientService;
  let userSystemActionQueryBuilder: UserSystemActionDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSystemActionDbHandlerService,
        { provide: PrismaClientService, useValue: mockPrismaClientService },
        {
          provide: UserSystemActionDbQueryBuilderService,
          useValue: mockUserSystemActionDbQueryBuilder,
        },
      ],
    }).compile();

    service = module.get<UserSystemActionDbHandlerService>(
      UserSystemActionDbHandlerService,
    );
    prismaClient = module.get<PrismaClientService>(PrismaClientService);
    userSystemActionQueryBuilder =
      module.get<UserSystemActionDbQueryBuilderService>(
        UserSystemActionDbQueryBuilderService,
      );
  });

  it('should be defined and dependencies injected', () => {
    expect(service).toBeDefined();
    expect(prismaClient).toBeDefined();
    expect(userSystemActionQueryBuilder).toBeDefined();
  });
});
