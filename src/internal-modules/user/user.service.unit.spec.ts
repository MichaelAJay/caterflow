import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CryptoService } from '../../system/modules/crypto/crypto.service';
import { mockUserDbHandlerService } from '../../../test/mocks/providers/mock_user_db_handler';
import { mockCryptoService } from '../../../test/mocks/providers/mock_crypto';
import { User } from '@prisma/client';
import { DataAccessService } from '../external-handlers/data-access/data-access.service';
import { mockGeneralDataAccessService } from '../../../test/mocks/providers/data-access-services/general_data_access_service';

describe('UserService', () => {
  let service: UserService;
  let userDbHandler: UserDbHandlerService;
  let cryptoService: CryptoService;
  let dataService: DataAccessService<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserDbHandlerService, useValue: mockUserDbHandlerService },
        { provide: CryptoService, useValue: mockCryptoService },
        { provide: DataAccessService, useValue: mockGeneralDataAccessService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userDbHandler = module.get<UserDbHandlerService>(UserDbHandlerService);
    cryptoService = module.get<CryptoService>(CryptoService);
    dataService = module.get<DataAccessService<any>>(DataAccessService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const name = 'John Doe';
    const email = 'john@example.com';
    const extAuthUID = '123';
    it('should encrypt name and encrypt and hash email, then create a user', async () => {
      const encryptSpy = jest
        .spyOn(cryptoService, 'encrypt')
        .mockResolvedValue('encrypted');
      const hashSpy = jest
        .spyOn(cryptoService, 'hash')
        .mockResolvedValue('hashedEmail');
      const createUserSpy = jest
        .spyOn(userDbHandler, 'createUser')
        .mockResolvedValue({} as User);

      await service.createUser(name, email, extAuthUID);
      expect(encryptSpy).toHaveBeenCalledTimes(2);
      expect(encryptSpy).toHaveBeenCalledWith(name);
      expect(encryptSpy).toHaveBeenCalledWith(email);
      expect(hashSpy).toHaveBeenCalledTimes(1);
      expect(hashSpy).toHaveBeenCalledWith(email);
      expect(createUserSpy).toHaveBeenCalledWith({
        extAuthUID,
        nameEncrypted: 'encrypted',
        emailEncrypted: 'encrypted',
        emailHashed: 'hashedEmail',
        emailVerified: false,
      });
    });
    it('should call userDbHandler.createUser with emailVerified: false (default) if arg not included', async () => {
      jest.spyOn(cryptoService, 'encrypt').mockResolvedValue('encrypted');
      jest.spyOn(cryptoService, 'hash').mockResolvedValue('hashedEmail');
      const createUserSpy = jest
        .spyOn(userDbHandler, 'createUser')
        .mockResolvedValue({} as User);

      await service.createUser(name, email, extAuthUID);
      expect(createUserSpy).toHaveBeenCalledWith({
        extAuthUID,
        nameEncrypted: 'encrypted',
        emailEncrypted: 'encrypted',
        emailHashed: 'hashedEmail',
        emailVerified: false,
      });
    });
    it('should call userDbHandler.createUser with emailVerified: true if arg included', async () => {
      jest.spyOn(cryptoService, 'encrypt').mockResolvedValue('encrypted');
      jest.spyOn(cryptoService, 'hash').mockResolvedValue('hashedEmail');
      const createUserSpy = jest
        .spyOn(userDbHandler, 'createUser')
        .mockResolvedValue({} as User);

      await service.createUser(name, email, extAuthUID, true);
      expect(createUserSpy).toHaveBeenCalledWith({
        extAuthUID,
        nameEncrypted: 'encrypted',
        emailEncrypted: 'encrypted',
        emailHashed: 'hashedEmail',
        emailVerified: true,
      });
    });
    it('should propagate an error if hash fails', async () => {
      const encryptSpy = jest
        .spyOn(cryptoService, 'encrypt')
        .mockResolvedValue('encrypted');
      const hashSpy = jest
        .spyOn(cryptoService, 'hash')
        .mockRejectedValue(new Error('Hash error'));
      const createUserSpy = jest.spyOn(userDbHandler, 'createUser');

      await expect(service.createUser(name, email, extAuthUID)).rejects.toThrow(
        'Hash error',
      );
      expect(encryptSpy).toHaveBeenCalledTimes(2);
      expect(encryptSpy).toHaveBeenCalledWith(name);
      expect(encryptSpy).toHaveBeenCalledWith(email);
      expect(hashSpy).toHaveBeenCalledWith(email);
      expect(createUserSpy).not.toHaveBeenCalled();
    });
    it('should propagate an error if encrypt fails', async () => {
      const encryptSpy = jest
        .spyOn(cryptoService, 'encrypt')
        .mockResolvedValueOnce('encrypted')
        .mockRejectedValueOnce(new Error('Encrypt error'));
      const hashSpy = jest
        .spyOn(cryptoService, 'hash')
        .mockResolvedValue('hashed');
      const createUserSpy = jest.spyOn(userDbHandler, 'createUser');

      await expect(service.createUser(name, email, extAuthUID)).rejects.toThrow(
        'Encrypt error',
      );
      expect(encryptSpy).toHaveBeenCalledTimes(2);
      expect(encryptSpy).toHaveBeenCalledWith(name);
      expect(encryptSpy).toHaveBeenCalledWith(email);
      expect(hashSpy).toHaveBeenCalledWith(email);
      expect(createUserSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    const id = '123';
    const updates = { emailVerified: true };
    it('should call userDbHandler.updateUser with the correct arguments and return void on success', async () => {
      const spy = jest
        .spyOn(userDbHandler, 'updateUser')
        .mockResolvedValue({} as User);
      const result = await service.updateUser(id, updates);
      expect(spy).toHaveBeenCalledWith(id, updates);
      expect(result).toBe(undefined);
    });
    it('should propagate any error thrown by userDbhandler.updateUser', async () => {
      jest
        .spyOn(userDbHandler, 'updateUser')
        .mockRejectedValue(new Error('Test error'));

      await expect(service.updateUser(id, updates)).rejects.toThrow(
        'Test error',
      );
    });
  });

  describe('getUserByExternalUID', () => {
    it('should return a user for a valid external UID', async () => {
      const externalUID = 'valid-external-uid';
      const expectedUser = {
        id: 'user-id',
        name: 'John Doe',
        externalUID: externalUID,
      };

      jest
        .spyOn(userDbHandler, 'retrieveUserByExternalAuthUID')
        .mockResolvedValue(expectedUser);

      await expect(service.getUserByExternalUID(externalUID)).resolves.toEqual(
        expectedUser,
      );
      expect(userDbHandler.retrieveUserByExternalAuthUID).toHaveBeenCalledWith(
        externalUID,
      );
    });

    it('should return null if no user is found for the external UID', async () => {
      const externalUID = 'non-existent-external-uid';

      jest
        .spyOn(userDbHandler, 'retrieveUserByExternalAuthUID')
        .mockResolvedValue(null);

      await expect(
        service.getUserByExternalUID(externalUID),
      ).resolves.toBeNull();
      expect(userDbHandler.retrieveUserByExternalAuthUID).toHaveBeenCalledWith(
        externalUID,
      );
    });

    it('should propagate any errors from the userDbHandler', async () => {
      const externalUID = 'error-prone-external-uid';
      const error = new Error('An unexpected error occurred');

      jest
        .spyOn(userDbHandler, 'retrieveUserByExternalAuthUID')
        .mockRejectedValue(error);

      await expect(service.getUserByExternalUID(externalUID)).rejects.toThrow(
        error,
      );
    });
  });
});
