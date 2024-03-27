import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleAndPermissionDbHandlerService } from './company-role-and-permission-db-handler.service';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockCompanyRoleAndPermissionDbQueryBuilder } from '../../../../../test/mocks/providers/mock_company_role_and_permission_db_querybuilder';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { LogService } from '../../../../system/modules/log/log.service';
import { mockLogService } from '../../../../../test/mocks/providers/mock_log_service';

describe('CompanyRoleAndPermissionDbHandlerService', () => {
  let service: CompanyRoleAndPermissionDbHandlerService;
  let companyRoleAndPermissionDbQueryBuilder: CompanyRoleAndPermissionDbQueryBuilderService;
  let prismaClient: PrismaClientService;
  let logService: LogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyRoleAndPermissionDbHandlerService,
        {
          provide: CompanyRoleAndPermissionDbQueryBuilderService,
          useValue: mockCompanyRoleAndPermissionDbQueryBuilder,
        },
        {
          provide: PrismaClientService,
          useValue: mockPrismaClientService,
        },
        { provide: LogService, useValue: mockLogService },
      ],
    }).compile();

    service = module.get<CompanyRoleAndPermissionDbHandlerService>(
      CompanyRoleAndPermissionDbHandlerService,
    );
    companyRoleAndPermissionDbQueryBuilder =
      module.get<CompanyRoleAndPermissionDbQueryBuilderService>(
        CompanyRoleAndPermissionDbQueryBuilderService,
      );
    prismaClient = module.get<PrismaClientService>(PrismaClientService);
    logService = module.get<LogService>(LogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
