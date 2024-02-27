import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { AccountDbHandlerService } from '../external-handlers/db-handlers/account-db-handler/account-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { mockAccountDbHandlerService } from '../../../test/mocks/providers/mock_account_db_handler';
import { mockUserDbHandlerService } from '../../../test/mocks/providers/mock_user_db_handler';
import { Account, User } from '@prisma/client';

describe('AccountService', () => {
  let service: AccountService;
  let accountDbHandler: AccountDbHandlerService;
  let userDbHandler: UserDbHandlerService;

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
    accountDbHandler = module.get<AccountDbHandlerService>(
      AccountDbHandlerService,
    );
    userDbHandler = module.get<UserDbHandlerService>(UserDbHandlerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const accountName = 'Test Account';
    const ownerId = 'ownerId';
    const mockAccountId = 'accountId';

    it('should successfully create an account and update the user', async () => {
      const createAccountSpy = jest
        .spyOn(accountDbHandler, 'createAccount')
        .mockResolvedValue({ id: mockAccountId } as Account);
      const updateUserSpy = jest
        .spyOn(userDbHandler, 'updateUser')
        .mockResolvedValue({} as User);

      await expect(
        service.createAccount(accountName, ownerId),
      ).resolves.toBeUndefined();
      expect(createAccountSpy).toHaveBeenCalledWith(accountName, ownerId);
      expect(updateUserSpy).toHaveBeenCalledWith(ownerId, {
        accountId: mockAccountId,
      });
    });
    it('should propagate an error thrown during create account', async () => {
      const errMsg = 'Create account failed';
      const error = new Error(errMsg);

      jest.spyOn(accountDbHandler, 'createAccount').mockRejectedValue(error);
      await expect(service.createAccount(accountName, ownerId)).rejects.toThrow(
        errMsg,
      );
      expect(userDbHandler.updateUser).not.toHaveBeenCalled();
    });
    it('should propagate an error thrown during update user', async () => {
      const errMsg = 'Update user failed';
      const error = new Error(errMsg);

      const createAccountSpy = jest
        .spyOn(accountDbHandler, 'createAccount')
        .mockResolvedValue({ id: mockAccountId } as Account);

      jest.spyOn(userDbHandler, 'updateUser').mockRejectedValue(error);

      await expect(service.createAccount(accountName, ownerId)).rejects.toThrow(
        errMsg,
      );
      expect(createAccountSpy).toHaveBeenCalledTimes(1);
    });
  });
});
