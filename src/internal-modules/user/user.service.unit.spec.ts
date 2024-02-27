import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { mockUserDbHandlerService } from '../../../test/mocks/providers/mock_user_db_handler';

describe('UserService', () => {
  let service: UserService;
  let userDbHandler: UserDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserDbHandlerService, useValue: mockUserDbHandlerService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userDbHandler = module.get<UserDbHandlerService>(UserDbHandlerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
