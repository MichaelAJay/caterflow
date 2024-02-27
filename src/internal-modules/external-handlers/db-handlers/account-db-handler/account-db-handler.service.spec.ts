import { Test, TestingModule } from '@nestjs/testing';
import { AccountDbHandlerService } from './account-db-handler.service';
import { AccountDbQueryBuilderService } from './account-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockAccountDbQueryBuilderService } from '../../../../../test/mocks/providers/mock_account_db_querybuilder';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';

describe('AccountDbHandlerService', () => {
  let service: AccountDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountDbHandlerService,
        {
          provide: AccountDbQueryBuilderService,
          useValue: mockAccountDbQueryBuilderService,
        },
        { provide: PrismaClientService, useValue: mockPrismaClientService },
      ],
    }).compile();

    service = module.get<AccountDbHandlerService>(AccountDbHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
