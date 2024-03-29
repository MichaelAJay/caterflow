import { Test, TestingModule } from '@nestjs/testing';
import { UserSystemActionDbHandlerService } from './user-system-action-db-handler.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { UserSystemActionDbQueryBuilderService } from './user-system-action-db-query-builder.service';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { mockUserSystemActionDbQueryBuilder } from '../../../../../test/mocks/providers/mock_user_system_action_db_querybuilder';
import { IBuildCreateUserSystemActionArgs } from './interfaces/query-builder-args.interface';
import { SystemAction } from '@prisma/client';

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

  afterEach(() => jest.clearAllMocks());

  it('should be defined and dependencies injected', () => {
    expect(service).toBeDefined();
    expect(prismaClient).toBeDefined();
    expect(userSystemActionQueryBuilder).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user system action', async () => {
      const now = new Date();

      const input: IBuildCreateUserSystemActionArgs = {
        userId: '1',
        action: 'AddIntegration',
        details: {},
      };
      const expectedResult = { id: '1', date: now, ...input, details: {} };

      const queryBuilderOutput = { data: input };
      jest
        .spyOn(userSystemActionQueryBuilder, 'buildCreateUserSystemActionQuery')
        .mockReturnValue(queryBuilderOutput);
      jest
        .spyOn(prismaClient.userSystemAction, 'create')
        .mockResolvedValue(expectedResult);

      const result = await service.create(input);

      expect(result).toEqual(expectedResult);
      expect(prismaClient.userSystemAction.create).toHaveBeenCalledWith(
        queryBuilderOutput,
      );
      expect(
        userSystemActionQueryBuilder.buildCreateUserSystemActionQuery,
      ).toHaveBeenCalledWith(input);
    });

    it('should throw an error when creation fails', async () => {
      const input: IBuildCreateUserSystemActionArgs = {
        userId: '1',
        action: 'AddIntegration',
        details: 'testDetails',
      };
      const error = new Error('Creation failed');

      const queryBuilderOutput = { data: input };
      jest
        .spyOn(userSystemActionQueryBuilder, 'buildCreateUserSystemActionQuery')
        .mockReturnValue(queryBuilderOutput);
      jest
        .spyOn(prismaClient.userSystemAction, 'create')
        .mockRejectedValue(error);

      await expect(service.create(input)).rejects.toThrow(error);
      expect(prismaClient.userSystemAction.create).toHaveBeenCalledWith(
        queryBuilderOutput,
      );
      expect(
        userSystemActionQueryBuilder.buildCreateUserSystemActionQuery,
      ).toHaveBeenCalledWith(input);
    });
  });

  describe('createMany', () => {
    const mockInput: IBuildCreateUserSystemActionArgs[] = [
      { userId: 'user1', action: 'AddIntegration', details: {} },
      { userId: 'user2', action: 'AddIntegration', details: {} },
    ];
    const mockResult = { count: 2 }; // Assuming the result format for demonstration

    beforeEach(() => {
      jest
        .spyOn(
          userSystemActionQueryBuilder,
          'buildCreateManyUserSystemActionsQuery',
        )
        .mockReturnValue({ data: mockInput });
      jest
        .spyOn(prismaClient.userSystemAction, 'createMany')
        .mockResolvedValue(mockResult);
    });

    it('should successfully create multiple user system actions', async () => {
      const result = await service.createMany(mockInput);
      expect(result).toEqual(mockResult);
      expect(
        userSystemActionQueryBuilder.buildCreateManyUserSystemActionsQuery,
      ).toHaveBeenCalledWith(mockInput);
      expect(prismaClient.userSystemAction.createMany).toHaveBeenCalledWith({
        data: mockInput,
      });
    });

    it('should throw an error when the database operation fails', async () => {
      const errorMessage = 'Database operation failed';
      jest
        .spyOn(prismaClient.userSystemAction, 'createMany')
        .mockRejectedValue(new Error(errorMessage));

      await expect(service.createMany(mockInput)).rejects.toThrow(errorMessage);
    });
  });

  describe('retrieveOne', () => {
    it('should successfully retrieve a unique user system action', async () => {
      const id = '1';
      const now = new Date();
      const expectedResult = {
        id: '1',
        userId: '1',
        action: 'AddIntegration' as SystemAction,
        details: {},
        date: now,
      };

      const queryBuilderOutput = { where: { id } };
      jest
        .spyOn(
          userSystemActionQueryBuilder,
          'buildRetrieveUniqueUserSystemActionQuery',
        )
        .mockReturnValue(queryBuilderOutput);
      jest
        .spyOn(prismaClient.userSystemAction, 'findUnique')
        .mockResolvedValue(expectedResult);

      const result = await service.retrieveOne(id);

      expect(result).toEqual(expectedResult);
      expect(prismaClient.userSystemAction.findUnique).toHaveBeenCalledWith(
        queryBuilderOutput,
      );
      expect(
        userSystemActionQueryBuilder.buildRetrieveUniqueUserSystemActionQuery,
      ).toHaveBeenCalledWith(id);
    });

    it('should throw an error when retrieval fails', async () => {
      const id = '1';
      const error = new Error('Retrieval failed');

      const queryBuilderOutput = { where: { id } };
      jest
        .spyOn(
          userSystemActionQueryBuilder,
          'buildRetrieveUniqueUserSystemActionQuery',
        )
        .mockReturnValue(queryBuilderOutput);
      jest
        .spyOn(prismaClient.userSystemAction, 'findUnique')
        .mockRejectedValue(error);

      await expect(service.retrieveOne(id)).rejects.toThrow(error);
      expect(prismaClient.userSystemAction.findUnique).toHaveBeenCalledWith(
        queryBuilderOutput,
      );
      expect(
        userSystemActionQueryBuilder.buildRetrieveUniqueUserSystemActionQuery,
      ).toHaveBeenCalledWith(id);
    });
  });
});
