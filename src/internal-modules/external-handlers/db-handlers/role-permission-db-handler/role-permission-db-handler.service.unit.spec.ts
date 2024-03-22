import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionDbHandlerService } from './role-permission-db-handler.service';
import { RolePermissionDbQueryBuilderService } from './role-permission-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockRolePermissionDbQueryBuilder } from '../../../../../test/mocks/providers/mock_role_permission_db_querybuilder';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';

describe('RolePermissionDbHandlerService', () => {
  let service: RolePermissionDbHandlerService;
  let rolePermissionDbQueryBuilder: RolePermissionDbQueryBuilderService;
  let prismaClient: PrismaClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolePermissionDbHandlerService,
        {
          provide: RolePermissionDbQueryBuilderService,
          useValue: mockRolePermissionDbQueryBuilder,
        },
        {
          provide: PrismaClientService,
          useValue: mockPrismaClientService,
        },
      ],
    }).compile();

    service = module.get<RolePermissionDbHandlerService>(
      RolePermissionDbHandlerService,
    );
    rolePermissionDbQueryBuilder =
      module.get<RolePermissionDbQueryBuilderService>(
        RolePermissionDbQueryBuilderService,
      );
    prismaClient = module.get<PrismaClientService>(PrismaClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
