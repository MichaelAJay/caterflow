import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleAndPermissionDbHandlerService } from '../../../internal-modules/external-handlers/db-handlers/company-role-and-permission-db-handler/company-role-and-permission-db-handler.service';
import { PermissionGuard } from './permission.guard';
import { Reflector } from '@nestjs/core';
import { mockCompanyRoleAndPermissionDbHandler } from '../../../../test/mocks/providers/mock_company_role_and_permission_db_handler';
import { DataAccessService } from '../../../internal-modules/external-handlers/data-access/data-access.service';
import { $Enums } from '@prisma/client';
import { mockGeneralDataAccessService } from '../../../../test/mocks/providers/data-access-services/general_data_access_service';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let companyPermissionService: CompanyRoleAndPermissionDbHandlerService;
  let dataAccessService: DataAccessService<Set<$Enums.PermissionName>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionGuard,
        { provide: Reflector, useValue: { get: jest.fn() } },
        {
          provide: CompanyRoleAndPermissionDbHandlerService,
          useValue: mockCompanyRoleAndPermissionDbHandler,
        },
        { provide: DataAccessService, useValue: mockGeneralDataAccessService },
      ],
    }).compile();

    guard = module.get<PermissionGuard>(PermissionGuard);
    companyPermissionService =
      module.get<CompanyRoleAndPermissionDbHandlerService>(
        CompanyRoleAndPermissionDbHandlerService,
      );
    dataAccessService =
      module.get<DataAccessService<Set<$Enums.PermissionName>>>(
        DataAccessService,
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
});
