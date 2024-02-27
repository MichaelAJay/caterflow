import { Test, TestingModule } from '@nestjs/testing';
import { AccountDbHandlerService } from './account-db-handler.service';
import { AccountDbQueryBuilderService } from './account-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockAccountDbQueryBuilderService } from '../../../../../test/mocks/providers/mock_account_db_querybuilder';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('AccountDbHandlerService', () => {
  let service: AccountDbHandlerService;
  let accountDbQueryBuilder: AccountDbQueryBuilderService;
  let prismaClient: PrismaClientService;

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
    accountDbQueryBuilder = module.get<AccountDbQueryBuilderService>(
      AccountDbQueryBuilderService,
    );
    prismaClient = module.get<PrismaClientService>(PrismaClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const accountData = { name: 'Test Account', ownerId: 'ownerId' };
    const createdAccount = {
      ...accountData,
      id: 'generatedId',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create an account and return it if ownerId references an existing user not referenced in another account record', async () => {
      jest
        .spyOn(accountDbQueryBuilder, 'buildCreateAccountQuery')
        .mockReturnValue({ data: accountData });
      jest
        .spyOn(prismaClient.account, 'create')
        .mockResolvedValue(createdAccount);

      const result = await service.createAccount(
        accountData.name,
        accountData.ownerId,
      );
      expect(result).toEqual(createdAccount);
      expect(
        accountDbQueryBuilder.buildCreateAccountQuery,
      ).toHaveBeenCalledWith({
        name: accountData.name,
        ownerId: accountData.ownerId,
      });
      expect(prismaClient.account.create).toHaveBeenCalledWith({
        data: accountData,
      });
    });

    it('should throw an error if the ownerId unique constraint is violated', async () => {
      jest
        .spyOn(accountDbQueryBuilder, 'buildCreateAccountQuery')
        .mockReturnValue({ data: accountData });
      jest
        .spyOn(prismaClient.account, 'create')
        .mockRejectedValue(
          new PrismaClientKnownRequestError('', { code: 'P2002' } as any),
        );

      try {
        await service.createAccount(accountData.name, accountData.ownerId);
      } catch (error) {
        expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
        expect(error.code).toBe('P2002');
      }
    });

    it('should throw an error if the ownerId existence constraint is violated', async () => {
      jest
        .spyOn(accountDbQueryBuilder, 'buildCreateAccountQuery')
        .mockReturnValue({ data: accountData });
      jest
        .spyOn(prismaClient.account, 'create')
        .mockRejectedValue(
          new PrismaClientKnownRequestError('', { code: 'P2003' } as any),
        );

      try {
        await service.createAccount(accountData.name, accountData.ownerId);
      } catch (error) {
        expect(error).toBeInstanceOf(PrismaClientKnownRequestError);
        expect(error.code).toBe('P2003');
      }
    });
  });
});
