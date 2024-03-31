import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyService } from './catering-company.service';
import { CateringCompanyDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { mockCateringCompanyDbHandlerService } from '../../../test/mocks/providers/mock_catering_company_db_handler';
import { mockUserDbHandlerService } from '../../../test/mocks/providers/mock_user_db_handler';
import { CompanyRoleAndPermissionDbHandlerService } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';
import { mockCompanyRoleAndPermissionDbHandler } from '../../../test/mocks/providers/mock_company_role_and_permission_db_handler';

describe('CateringCompanyService', () => {
  let service: CateringCompanyService;
  let cateringCompanyDbHandler: CateringCompanyDbHandlerService;
  let userDbHandler: UserDbHandlerService;
  let companyRoleDbHandler: CompanyRoleAndPermissionDbHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CateringCompanyService,
        {
          provide: CateringCompanyDbHandlerService,
          useValue: mockCateringCompanyDbHandlerService,
        },
        { provide: UserDbHandlerService, useValue: mockUserDbHandlerService },
        {
          provide: CompanyRoleAndPermissionDbHandlerService,
          useValue: mockCompanyRoleAndPermissionDbHandler,
        },
      ],
    }).compile();

    service = module.get<CateringCompanyService>(CateringCompanyService);
    cateringCompanyDbHandler = module.get<CateringCompanyDbHandlerService>(
      CateringCompanyDbHandlerService,
    );
    userDbHandler = module.get<UserDbHandlerService>(UserDbHandlerService);
    companyRoleDbHandler = module.get<CompanyRoleAndPermissionDbHandlerService>(
      CompanyRoleAndPermissionDbHandlerService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCateringCompany', () => {
    const companyName = 'Test Company';
    const ownerId = 'owner-id';
    const companyId = 'company-id';

    it('should create a catering company and assign owner', async () => {
      const createCateringCompanyMock = jest
        .spyOn(cateringCompanyDbHandler, 'createCateringCompany')
        .mockResolvedValueOnce({ id: companyId } as any);
      const initializeRolesAndAssignOwnerMock = jest
        .spyOn(companyRoleDbHandler, 'initializeRolesAndAssignOwner')
        .mockResolvedValueOnce(undefined as any);
      const updateUserMock = jest
        .spyOn(userDbHandler, 'updateUser')
        .mockResolvedValueOnce(undefined as any);

      await service.createCateringCompany(companyName, ownerId);

      expect(createCateringCompanyMock).toHaveBeenCalledWith(
        companyName,
        ownerId,
      );
      expect(initializeRolesAndAssignOwnerMock).toHaveBeenCalledWith(
        companyId,
        ownerId,
      );
      expect(updateUserMock).toHaveBeenCalledWith(ownerId, { companyId });
    });

    it('should throw an error if creating catering company fails', async () => {
      const errorMessage = 'Failed to create catering company';
      jest
        .spyOn(cateringCompanyDbHandler, 'createCateringCompany')
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        service.createCateringCompany(companyName, ownerId),
      ).rejects.toThrow(errorMessage);
      expect(
        companyRoleDbHandler.initializeRolesAndAssignOwner,
      ).not.toHaveBeenCalled();
      expect(userDbHandler.updateUser).not.toHaveBeenCalled();
    });

    it('should throw an error if initializing roles and assigning owner fails', async () => {
      const errorMessage = 'Failed to initialize roles and assign owner';
      jest
        .spyOn(cateringCompanyDbHandler, 'createCateringCompany')
        .mockResolvedValueOnce({ id: companyId } as any);
      jest
        .spyOn(companyRoleDbHandler, 'initializeRolesAndAssignOwner')
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        service.createCateringCompany(companyName, ownerId),
      ).rejects.toThrow(errorMessage);
      expect(userDbHandler.updateUser).not.toHaveBeenCalled();
    });

    it('should throw an error if updating user fails', async () => {
      const errorMessage = 'Failed to update user';
      jest
        .spyOn(cateringCompanyDbHandler, 'createCateringCompany')
        .mockResolvedValueOnce({ id: companyId } as any);
      jest
        .spyOn(companyRoleDbHandler, 'initializeRolesAndAssignOwner')
        .mockResolvedValueOnce(undefined as any);
      jest
        .spyOn(userDbHandler, 'updateUser')
        .mockRejectedValueOnce(new Error(errorMessage));

      await expect(
        service.createCateringCompany(companyName, ownerId),
      ).rejects.toThrow(errorMessage);
    });
  });
});
