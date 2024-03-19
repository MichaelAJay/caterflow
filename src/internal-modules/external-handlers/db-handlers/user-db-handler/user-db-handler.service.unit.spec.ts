import { Test, TestingModule } from '@nestjs/testing';
import { UserDbHandlerService } from './user-db-handler.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { UserDbQueryBuilderService } from './user-db-query-builder.service.unit';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { mockUserDbQueryBuilderService } from '../../../../../test/mocks/providers/mock_user_db_querybuilder';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { User } from '@prisma/client';
import { ConflictException } from '@nestjs/common';
import { ERROR_CODE } from '../../../../common/codes/error-codes';

describe('UserDbHandlerService', () => {
  let service: UserDbHandlerService;
  let userQueryBuilder: UserDbQueryBuilderService;
  let prismaClient: PrismaClientService;

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
    userQueryBuilder = module.get<UserDbQueryBuilderService>(
      UserDbQueryBuilderService,
    );
    prismaClient = module.get<PrismaClientService>(PrismaClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createUserInput: {
      emailEncrypted: string;
      emailHashed: string;
      nameEncrypted: string;
      extAuthUID: string;
      companyId?: string;
    } = {
      emailEncrypted: 'encryptedEmail',
      emailHashed: 'hashedEmail',
      nameEncrypted: 'encryptedName',
      extAuthUID: 'externalAuthUID',
    };

    const now = new Date();

    it('should create a user and return it with null companyId if companyId not provided', async () => {
      const expectedResult = {
        id: 'uuid',
        ...createUserInput,
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
        companyId: null,
      };

      jest
        .spyOn(userQueryBuilder, 'buildCreateUserQuery')
        .mockReturnValue({ data: createUserInput });

      const createUserSpy = jest
        .spyOn(prismaClient.user, 'create')
        .mockResolvedValue(expectedResult);

      const result = await service.createUser(createUserInput);
      expect(result).toEqual(expectedResult);
      expect(createUserSpy).toHaveBeenCalledWith({
        data: createUserInput,
      });
    });
    it('should create a user and return it with companyId if provided', async () => {
      const companyId = 'companyId';
      createUserInput.companyId = companyId;

      const expectedResult = {
        id: 'uuid',
        ...createUserInput,
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
        companyId,
      };

      jest
        .spyOn(userQueryBuilder, 'buildCreateUserQuery')
        .mockReturnValue({ data: createUserInput });

      const spy = jest
        .spyOn(prismaClient.user, 'create')
        .mockResolvedValue(expectedResult);

      const result = await service.createUser(createUserInput);
      expect(result).toEqual(expectedResult);
      expect(spy).toHaveBeenCalledWith({
        data: createUserInput,
      });
    });
    it('should throw a unique constraint violation error if emailHashed is not unique', async () => {
      expect.assertions(2);

      jest
        .spyOn(userQueryBuilder, 'buildCreateUserQuery')
        .mockReturnValue({ data: createUserInput });

      jest
        .spyOn(prismaClient.user, 'create')
        .mockRejectedValue(
          new PrismaClientKnownRequestError('', { code: 'P2002' } as any),
        );

      try {
        await service.createUser(createUserInput);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.response.code).toBe(ERROR_CODE.Conflict);
      }
    });
    it('should propagate any unspecified error thrown by the db client', async () => {
      expect.assertions(1);

      jest
        .spyOn(userQueryBuilder, 'buildCreateUserQuery')
        .mockReturnValue({ data: createUserInput });

      jest
        .spyOn(prismaClient.user, 'create')
        .mockRejectedValue(new PrismaClientUnknownRequestError('', {} as any));

      try {
        await service.createUser(createUserInput);
      } catch (error) {
        expect(error).toBeInstanceOf(PrismaClientUnknownRequestError);
      }
    });
  });

  describe('retrieveUserByExternalAuthUID', () => {
    const externalAuthUID = 'externalAuthUID';
    const queryArg = { extAuthUID: externalAuthUID };
    const date = new Date();
    const user: User = {
      id: 'uuid',
      extAuthUID: externalAuthUID,
      nameEncrypted: 'encryptedName',
      companyId: null,
      emailEncrypted: '',
      emailHashed: '',
      emailVerified: false,
      createdAt: date,
      updatedAt: date,
    };

    it('should retrieve an existing user by externalAuthUID and return it', async () => {
      const queryBuilderReturn = { where: queryArg };
      const queryBuilderSpy = jest
        .spyOn(userQueryBuilder, 'buildFindUniqueUserWhereClause')
        .mockReturnValue(queryBuilderReturn);
      const findUniqueUserSpy = jest
        .spyOn(prismaClient.user, 'findUnique')
        .mockResolvedValue(user);

      const result =
        await service.retrieveUserByExternalAuthUID(externalAuthUID);
      expect(result).toEqual(user);
      expect(findUniqueUserSpy).toHaveBeenCalledWith(queryBuilderReturn);
      expect(queryBuilderSpy).toHaveBeenCalledWith(queryArg);
    });
    it('should return null if existing user not found', async () => {
      const queryBuilderReturn = { where: queryArg };
      jest
        .spyOn(userQueryBuilder, 'buildFindUniqueUserWhereClause')
        .mockReturnValue(queryBuilderReturn);
      jest.spyOn(prismaClient.user, 'findUnique').mockResolvedValue(null);

      const result =
        await service.retrieveUserByExternalAuthUID(externalAuthUID);
      expect(result).toEqual(null);
    });
    it('should propagate any unspecified error thrown by the db client', async () => {
      const queryBuilderReturn = { where: queryArg };
      jest
        .spyOn(userQueryBuilder, 'buildFindUniqueUserWhereClause')
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.user, 'findUnique')
        .mockRejectedValue(new PrismaClientUnknownRequestError('', {} as any));

      await expect(
        service.retrieveUserByExternalAuthUID(externalAuthUID),
      ).rejects.toThrow(PrismaClientUnknownRequestError);
    });
  });

  describe('updateUser', () => {
    const date = new Date();
    const userId = 'uuid';
    const updateUserInput = { companyId: 'companyId' };
    const updatedUser: User = {
      id: userId,
      ...updateUserInput,
      extAuthUID: '',
      emailEncrypted: '',
      emailHashed: '',
      nameEncrypted: '',
      emailVerified: false,
      createdAt: date,
      updatedAt: date,
    };
    it('should update a user and return it', async () => {
      const userUpdateArgs = {
        where: { id: userId },
        data: { ...updatedUser },
      };

      jest
        .spyOn(userQueryBuilder, 'buildUpdateUser')
        .mockReturnValue(userUpdateArgs);

      const spy = jest
        .spyOn(prismaClient.user, 'update')
        .mockResolvedValue(updatedUser);

      const result = await service.updateUser(userId, updateUserInput);
      expect(result).toEqual(updatedUser);
      expect(spy).toHaveBeenCalledWith(userUpdateArgs);
    });
    it('should throw a foreign key constraint error if updated companyId does not reference an existing company', async () => {
      expect.assertions(2);

      const userUpdateArgs = {
        where: { id: userId },
        data: { ...updatedUser },
      };

      jest
        .spyOn(userQueryBuilder, 'buildUpdateUser')
        .mockReturnValue(userUpdateArgs);

      jest
        .spyOn(prismaClient.user, 'update')
        .mockRejectedValue(
          new PrismaClientKnownRequestError('', { code: 'P2003' } as any),
        );

      try {
        await service.updateUser(userId, updateUserInput);
      } catch (err) {
        expect(err).toBeInstanceOf(PrismaClientKnownRequestError);
        expect(err.code).toBe('P2003');
      }
    });
    it('should propagate any unspecified error thrown by the db client', async () => {
      const userUpdateArgs = {
        where: { id: userId },
        data: { ...updatedUser },
      };

      jest
        .spyOn(userQueryBuilder, 'buildUpdateUser')
        .mockReturnValue(userUpdateArgs);

      jest
        .spyOn(prismaClient.user, 'update')
        .mockRejectedValue(new PrismaClientUnknownRequestError('', {} as any));

      await expect(service.updateUser(userId, updateUserInput)).rejects.toThrow(
        PrismaClientUnknownRequestError,
      );
    });
  });
});
