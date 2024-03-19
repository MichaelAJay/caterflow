import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyService } from './catering-company.service';
import { CateringCompanyDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { mockCateringCompanyDbHandlerService } from '../../../test/mocks/providers/mock_catering_company_db_handler';
import { mockUserDbHandlerService } from '../../../test/mocks/providers/mock_user_db_handler';
import { CateringCompany, User } from '@prisma/client';

describe('CateringCompanyService', () => {
  let service: CateringCompanyService;
  let cateringCompanyDbHandler: CateringCompanyDbHandlerService;
  let userDbHandler: UserDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CateringCompanyService,
        {
          provide: CateringCompanyDbHandlerService,
          useValue: mockCateringCompanyDbHandlerService,
        },
        { provide: UserDbHandlerService, useValue: mockUserDbHandlerService },
      ],
    }).compile();

    service = module.get<CateringCompanyService>(CateringCompanyService);
    cateringCompanyDbHandler = module.get<CateringCompanyDbHandlerService>(
      CateringCompanyDbHandlerService,
    );
    userDbHandler = module.get<UserDbHandlerService>(UserDbHandlerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCateringCompany', () => {
    const cateringCompanyName = 'Test CateringCompany';
    const ownerId = 'ownerId';
    const mockCateringCompanyId = 'CateringCompanyId';

    it('should successfully create a CateringCompany and update the user', async () => {
      const createCateringCompanySpy = jest
        .spyOn(cateringCompanyDbHandler, 'createCateringCompany')
        .mockResolvedValue({ id: mockCateringCompanyId } as CateringCompany);
      const updateUserSpy = jest
        .spyOn(userDbHandler, 'updateUser')
        .mockResolvedValue({} as User);

      await expect(
        service.createCateringCompany(cateringCompanyName, ownerId),
      ).resolves.toBeUndefined();
      expect(createCateringCompanySpy).toHaveBeenCalledWith(
        cateringCompanyName,
        ownerId,
      );
      expect(updateUserSpy).toHaveBeenCalledWith(ownerId, {
        companyId: mockCateringCompanyId,
      });
    });
    it('should propagate an error thrown during create company', async () => {
      const errMsg = 'Create company failed';
      const error = new Error(errMsg);

      jest
        .spyOn(cateringCompanyDbHandler, 'createCateringCompany')
        .mockRejectedValue(error);
      await expect(
        service.createCateringCompany(cateringCompanyName, ownerId),
      ).rejects.toThrow(errMsg);
      expect(userDbHandler.updateUser).not.toHaveBeenCalled();
    });
    it('should propagate an error thrown during update user', async () => {
      const errMsg = 'Update user failed';
      const error = new Error(errMsg);

      const createCateringCompanySpy = jest
        .spyOn(cateringCompanyDbHandler, 'createCateringCompany')
        .mockResolvedValue({ id: mockCateringCompanyId } as CateringCompany);

      jest.spyOn(userDbHandler, 'updateUser').mockRejectedValue(error);

      await expect(
        service.createCateringCompany(cateringCompanyName, ownerId),
      ).rejects.toThrow(errMsg);
      expect(createCateringCompanySpy).toHaveBeenCalledTimes(1);
    });
  });
});
