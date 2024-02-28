import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { CryptoService } from '../../system/modules/crypto/crypto.service';
import { mockUserDbHandlerService } from '../../../test/mocks/providers/mock_user_db_handler';
import { mockCryptoService } from '../../../test/mocks/providers/mock_crypto';
import { User } from '@prisma/client';

describe('UserService', () => {
  let service: UserService;
  let userDbHandler: UserDbHandlerService;
  let cryptoService: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserDbHandlerService, useValue: mockUserDbHandlerService },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userDbHandler = module.get<UserDbHandlerService>(UserDbHandlerService);
    cryptoService = module.get<CryptoService>(CryptoService);
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
    it('should call userDbHandler.updateUser with the correct arguments and return void on success', async () => {});
    it('should propagate any error thrown by userDbhandler.updateUser', async () => {});
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
