import { Test, TestingModule } from '@nestjs/testing';
import { CateringCompanyService } from './catering-company.service';
import { CateringCompanyDbHandlerService } from '../external-handlers/db-handlers/catering-company-db-handler/catering-company-db-handler.service';
import { UserDbHandlerService } from '../external-handlers/db-handlers/user-db-handler/user-db-handler.service';
import { mockCateringCompanyDbHandlerService } from '../../../test/mocks/providers/mock_catering_company_db_handler';
import { mockUserDbHandlerService } from '../../../test/mocks/providers/mock_user_db_handler';
import { CompanyRoleAndPermissionDbHandlerService } from '../external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';
import { mockCompanyRoleAndPermissionDbHandler } from '../../../test/mocks/providers/mock_company_role_and_permission_db_handler';
import { CompanyMapperService } from './company-mapper.service';
import { mockCompanyMapper } from '../../../test/mocks/providers/mock_company_mapper_service';
import { $Enums } from '@prisma/client';
import {
  CompanyIntegrationListItem,
  CompanyIntegrationOutputItem,
} from '../../common/types/company-integration-list-item.type';

describe('CateringCompanyService', () => {
  let service: CateringCompanyService;
  let cateringCompanyDbHandler: CateringCompanyDbHandlerService;
  let userDbHandler: UserDbHandlerService;
  let companyRoleDbHandler: CompanyRoleAndPermissionDbHandlerService;
  let companyMapper: CompanyMapperService;

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
        { provide: CompanyMapperService, useValue: mockCompanyMapper },
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
    companyMapper = module.get<CompanyMapperService>(CompanyMapperService);
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

  describe('retrieveIntegrationsList', () => {
    const companyId = 'company-1';
    const mockIntegrationRecords: CompanyIntegrationListItem[] = [
      {
        id: 'integration-1',
        event: 'ezCaterOrderReceived',
        template: {
          srcSystem: $Enums.ExternalSystem.ezCater,
          srcEntity: $Enums.ExternalEntity.Order,
          targetSystem: $Enums.ExternalSystem.Nutshell,
          targetEntity: $Enums.ExternalEntity.Lead,
        },
        isConfigured: true,
        isActive: true,
        createdAt: new Date(),
      } as CompanyIntegrationListItem,
      {
        id: 'integration-2',
        event: 'ezCaterOrderReceived',
        template: {
          srcSystem: $Enums.ExternalSystem.Nutshell,
          srcEntity: $Enums.ExternalEntity.Lead,
          targetSystem: $Enums.ExternalSystem.ezCater,
          targetEntity: $Enums.ExternalEntity.Order,
        },
        isConfigured: false,
        isActive: false,
        createdAt: new Date(),
      } as CompanyIntegrationListItem,
    ];
    const mockMappedIntegrations: CompanyIntegrationOutputItem[] = [
      {
        template: { src: 'ezCater Order', target: 'Nutshell Lead' },
        event: 'ezCater Order Received',
        isConfigured: true,
        isActive: true,
        createdAt: new Date(),
      },
      {
        template: { src: 'EzCater Menu', target: 'Company Menu' },
        event: 'ezCater Order Received',
        isConfigured: false,
        isActive: false,
        createdAt: new Date(),
      },
    ];

    beforeEach(() => {
      jest
        .spyOn(
          mockCateringCompanyDbHandlerService,
          'retrieveCompanyIntegrationsList',
        )
        .mockResolvedValue(mockIntegrationRecords);

      jest
        .spyOn(mockCompanyMapper, 'mapCompanyIntegrationListForOutput')
        .mockReturnValue(mockMappedIntegrations);
    });

    it('should call cateringCompanyDbHandler.retrieveCompanyIntegrationsList with the correct companyId', async () => {
      await service.retrieveIntegrationsList(companyId);
      expect(
        cateringCompanyDbHandler.retrieveCompanyIntegrationsList,
      ).toHaveBeenCalledWith(companyId);
    });

    it('should call companyMapper.mapCompanyIntegrationListForOutput with the retrieved integration records', async () => {
      await service.retrieveIntegrationsList(companyId);
      expect(
        companyMapper.mapCompanyIntegrationListForOutput,
      ).toHaveBeenCalledWith(mockIntegrationRecords);
    });

    it('should return the mapped integration list', async () => {
      const result = await service.retrieveIntegrationsList(companyId);
      expect(result).toEqual(mockMappedIntegrations);
    });

    it('should throw an error if cateringCompanyDbHandler.retrieveCompanyIntegrationsList throws an error', async () => {
      const errorMessage = 'Database error';
      jest
        .spyOn(
          mockCateringCompanyDbHandlerService,
          'retrieveCompanyIntegrationsList',
        )
        .mockRejectedValue(new Error(errorMessage));
      await expect(service.retrieveIntegrationsList(companyId)).rejects.toThrow(
        errorMessage,
      );
      expect(
        companyMapper.mapCompanyIntegrationListForOutput,
      ).not.toHaveBeenCalled();
    });

    it('should throw an error if companyMapper.mapCompanyIntegrationListForOutput throws an error', async () => {
      const errorMessage = 'Mapping error';
      jest
        .spyOn(mockCompanyMapper, 'mapCompanyIntegrationListForOutput')
        .mockImplementation(() => {
          throw new Error(errorMessage);
        });
      await expect(service.retrieveIntegrationsList(companyId)).rejects.toThrow(
        errorMessage,
      );
      expect(
        cateringCompanyDbHandler.retrieveCompanyIntegrationsList,
      ).toHaveBeenCalled();
    });
  });
});
