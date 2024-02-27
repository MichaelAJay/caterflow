import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountDbHandlerService } from '../external-handlers/db-handlers/account-db-handler/account-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { mockAccountDbHandlerService } from '../../../test/mocks/providers/mock_account_db_handler';
import { mockUserDbHandlerService } from '../../../test/mocks/providers/mock_user_db_handler';

describe('AccountService', () => {
  let service: AccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountDbHandlerService,
          useValue: mockAccountDbHandlerService,
        },
        { provide: UserDbHandlerService, useValue: mockUserDbHandlerService },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
