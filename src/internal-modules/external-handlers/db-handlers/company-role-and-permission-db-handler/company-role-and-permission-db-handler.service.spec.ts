import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleAndPermissionDbHandlerService } from './company-role-and-permission-db-handler.service';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockCompanyRoleAndPermissionDbQueryBuilder } from '../../../../../test/mocks/providers/mock_company_role_and_permission_db_querybuilder';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';

describe('CompanyRoleAndPermissionDbHandlerService', () => {
  let service: CompanyRoleAndPermissionDbHandlerService;
  let companyRoleAndPermissionDbQueryBuilder: CompanyRoleAndPermissionDbQueryBuilderService;
  let prismaClient: PrismaClientService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
