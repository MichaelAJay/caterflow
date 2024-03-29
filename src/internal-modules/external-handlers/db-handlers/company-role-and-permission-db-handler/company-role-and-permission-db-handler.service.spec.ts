import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleAndPermissionDbHandlerService } from './company-role-and-permission-db-handler.service';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockCompanyRoleAndPermissionDbQueryBuilder } from '../../../../../test/mocks/providers/mock_company_role_and_permission_db_querybuilder';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { LogService } from '../../../../system/modules/log/log.service';
import { mockLogService } from '../../../../../test/mocks/providers/mock_log_service';
import { $Enums, PermissionName, Prisma } from '@prisma/client';

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

  afterEach(() => jest.clearAllMocks());

  it('should be defined along with its dependencies', () => {
    expect(service).toBeDefined();
    expect(companyRoleAndPermissionDbQueryBuilder).toBeDefined();
    expect(prismaClient).toBeDefined();
    expect(logService).toBeDefined();
  });

  describe('initializeRoles', () => {
    let systemRolesWithPermissions: ({
      permissions: {
        id: number;
        name: $Enums.PermissionName;
      }[];
    } & {
      id: string;
      name: string;
      description: string;
      companyId: string | null;
      creatorId: string;
      isEditable: boolean;
    })[];
    it('should successfully initialize roles with permissions for a new company and return true', async () => {
      // Arrange
      const companyId = 'testCompanyId';
      const creatorId = 'testCreatorId';
      systemRolesWithPermissions = [
        {
          id: 'role1',
          name: 'Role 1',
          description: 'Role 1 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 1, name: PermissionName.ManageBilling },
            { id: 2, name: PermissionName.ManageCompanyRoles },
          ],
        },
        {
          id: 'role2',
          name: 'Role 2',
          description: 'Role 2 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 3, name: PermissionName.ManageIntegrations },
            { id: 4, name: PermissionName.ManageIntegrationAssets },
          ],
        },
      ];
      const roleCreateArgs = systemRolesWithPermissions.map((role) => ({
        data: {
          name: role.name,
          description: role.description,
          companyId,
          creatorId,
          isEditable: false,
          permissions: {
            connect: role.permissions.map(({ id }) => ({ id })),
          },
        },
      }));
      mockPrismaClientService.role.findMany.mockResolvedValue(
        systemRolesWithPermissions,
      );

      jest
        .spyOn(
          mockCompanyRoleAndPermissionDbQueryBuilder,
          'buildCreateManySingleCompanyRolesQuery',
        )
        .mockReturnValue(roleCreateArgs);

      // Act
      const result = await service.initializeRoles(companyId, creatorId);

      // Assert
      expect(result).toBe(true);
      expect(mockPrismaClientService.role.findMany).toHaveBeenCalledWith({
        where: { companyId: null },
        include: { permissions: true },
      });
      expect(
        mockCompanyRoleAndPermissionDbQueryBuilder.buildCreateManySingleCompanyRolesQuery,
      ).toHaveBeenCalledWith(systemRolesWithPermissions, companyId, creatorId);
      expect(mockPrismaClientService.$transaction).toHaveBeenCalledWith(
        roleCreateArgs.map((roleCreateArg) =>
          mockPrismaClientService.role.create(roleCreateArg),
        ),
      );
    });

    it('should call Prisma client findMany with correct parameters', async () => {
      // Arrange
      const companyId = 'testCompanyId';
      const creatorId = 'testCreatorId';
      const systemRolesWithPermissions = [
        {
          id: 'role1',
          name: 'Role 1',
          description: 'Role 1 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 1, name: PermissionName.ManageBilling },
            { id: 2, name: PermissionName.ManageCompanyRoles },
          ],
        },
        {
          id: 'role2',
          name: 'Role 2',
          description: 'Role 2 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 3, name: PermissionName.ManageIntegrations },
            { id: 4, name: PermissionName.ManageIntegrationAssets },
          ],
        },
      ];
      const roleCreateArgs = systemRolesWithPermissions.map((role) => ({
        data: {
          name: role.name,
          description: role.description,
          companyId,
          creatorId,
          isEditable: false,
          permissions: {
            connect: role.permissions.map(({ id }) => ({ id })),
          },
        },
      }));
      jest
        .spyOn(mockPrismaClientService.role, 'findMany')
        .mockResolvedValue(systemRolesWithPermissions);
      jest
        .spyOn(
          mockCompanyRoleAndPermissionDbQueryBuilder,
          'buildCreateManySingleCompanyRolesQuery',
        )
        .mockReturnValue(roleCreateArgs);

      // Act
      await service.initializeRoles(companyId, creatorId);

      // Assert
      expect(mockPrismaClientService.role.findMany).toHaveBeenCalledWith({
        where: { companyId: null },
        include: { permissions: true },
      });
    });

    it('should call buildCreateManySingleCompanyRolesQuery with correct parameters', async () => {
      // Arrange
      const companyId = 'testCompanyId';
      const creatorId = 'testCreatorId';
      const systemRolesWithPermissions = [
        {
          id: 'role1',
          name: 'Role 1',
          description: 'Role 1 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 1, name: PermissionName.ManageBilling },
            { id: 2, name: PermissionName.ManageCompanyRoles },
          ],
        },
        {
          id: 'role2',
          name: 'Role 2',
          description: 'Role 2 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 3, name: PermissionName.ManageIntegrations },
            { id: 4, name: PermissionName.ManageIntegrationAssets },
          ],
        },
      ];
      const roleCreateArgs = systemRolesWithPermissions.map((role) => ({
        data: {
          name: role.name,
          description: role.description,
          companyId,
          creatorId,
          isEditable: false,
          permissions: {
            connect: role.permissions.map(({ id }) => ({ id })),
          },
        },
      }));
      jest
        .spyOn(mockPrismaClientService.role, 'findMany')
        .mockResolvedValue(systemRolesWithPermissions);
      jest
        .spyOn(
          mockCompanyRoleAndPermissionDbQueryBuilder,
          'buildCreateManySingleCompanyRolesQuery',
        )
        .mockReturnValue(roleCreateArgs);

      // Act
      await service.initializeRoles(companyId, creatorId);

      // Assert
      expect(
        mockCompanyRoleAndPermissionDbQueryBuilder.buildCreateManySingleCompanyRolesQuery,
      ).toHaveBeenCalledWith(systemRolesWithPermissions, companyId, creatorId);
    });

    it('should call prismaService.$transaction with correct parameters', async () => {
      // Arrange
      const companyId = 'testCompanyId';
      const creatorId = 'testCreatorId';
      const systemRolesWithPermissions = [
        {
          id: 'role1',
          name: 'Role 1',
          description: 'Role 1 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 1, name: PermissionName.ManageBilling },
            { id: 2, name: PermissionName.ManageCompanyRoles },
          ],
        },
        {
          id: 'role2',
          name: 'Role 2',
          description: 'Role 2 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 3, name: PermissionName.ManageIntegrations },
            { id: 4, name: PermissionName.ManageIntegrationAssets },
          ],
        },
      ];
      const roleCreateArgs = systemRolesWithPermissions.map((role) => ({
        data: {
          name: role.name,
          description: role.description,
          companyId,
          creatorId,
          isEditable: false,
          permissions: {
            connect: role.permissions.map(({ id }) => ({ id })),
          },
        },
      }));
      jest
        .spyOn(mockPrismaClientService.role, 'findMany')
        .mockResolvedValue(systemRolesWithPermissions);
      jest
        .spyOn(
          mockCompanyRoleAndPermissionDbQueryBuilder,
          'buildCreateManySingleCompanyRolesQuery',
        )
        .mockReturnValue(roleCreateArgs);

      // Act
      await service.initializeRoles(companyId, creatorId);

      // Assert
      expect(mockPrismaClientService.$transaction).toHaveBeenCalledWith(
        roleCreateArgs.map((roleCreateArg) =>
          mockPrismaClientService.role.create(roleCreateArg),
        ),
      );
    });

    it('should execute a transaction with the correct number of create operations', async () => {
      // Arrange
      const companyId = 'testCompanyId';
      const creatorId = 'testCreatorId';
      const systemRolesWithPermissions = [
        {
          id: 'role1',
          name: 'Role 1',
          description: 'Role 1 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 1, name: PermissionName.ManageBilling },
            { id: 2, name: PermissionName.ManageCompanyRoles },
          ],
        },
        {
          id: 'role2',
          name: 'Role 2',
          description: 'Role 2 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 3, name: PermissionName.ManageIntegrations },
            { id: 4, name: PermissionName.ManageIntegrationAssets },
          ],
        },
      ];
      const roleCreateArgs = systemRolesWithPermissions.map((role) => ({
        data: {
          name: role.name,
          description: role.description,
          companyId,
          creatorId,
          isEditable: false,
          permissions: {
            connect: role.permissions.map(({ id }) => ({ id })),
          },
        },
      }));
      jest
        .spyOn(mockPrismaClientService.role, 'findMany')
        .mockResolvedValue(systemRolesWithPermissions);
      jest
        .spyOn(
          mockCompanyRoleAndPermissionDbQueryBuilder,
          'buildCreateManySingleCompanyRolesQuery',
        )
        .mockReturnValue(roleCreateArgs);

      // Act
      await service.initializeRoles(companyId, creatorId);

      // Assert
      expect(mockPrismaClientService.$transaction).toHaveBeenCalledWith(
        roleCreateArgs.map((roleCreateArg) =>
          mockPrismaClientService.role.create(roleCreateArg),
        ),
      );
      expect(
        mockPrismaClientService.$transaction.mock.calls[0][0],
      ).toHaveLength(systemRolesWithPermissions.length);
    });

    it('should handle the case when no system roles are found', async () => {
      // Arrange
      const companyId = 'testCompanyId';
      const creatorId = 'testCreatorId';
      systemRolesWithPermissions = [];
      jest
        .spyOn(mockPrismaClientService.role, 'findMany')
        .mockResolvedValue(systemRolesWithPermissions);

      jest
        .spyOn(
          mockCompanyRoleAndPermissionDbQueryBuilder,
          'buildCreateManySingleCompanyRolesQuery',
        )
        .mockReturnValue([]);

      // Act
      const result = await service.initializeRoles(companyId, creatorId);

      // Assert
      expect(result).toBe(false);
      expect(mockPrismaClientService.role.findMany).toHaveBeenCalledWith({
        where: { companyId: null },
        include: { permissions: true },
      });
      expect(mockPrismaClientService.$transaction).not.toHaveBeenCalled();
    });

    it('should return false and log an error and rethrow it when an error occurs during the findMany operation', async () => {
      // Arrange
      const companyId = 'testCompanyId';
      const creatorId = 'testCreatorId';
      const error = new Error('findMany error');
      jest
        .spyOn(mockPrismaClientService.role, 'findMany')
        .mockRejectedValue(error);

      // Act & Assert
      const result = await service.initializeRoles(companyId, creatorId);

      expect(result).toBe(false);
      expect(mockLogService.error).toHaveBeenCalledWith(
        error.message,
        error.stack ? error.stack : 'Stack trace unavailable',
        {
          companyId,
          message: 'Company role initialization failed',
        },
      );
    });

    it('should return false and log an error and rethrow it when an error occurs during the transaction', async () => {
      // Arrange
      const companyId = 'testCompanyId';
      const creatorId = 'testCreatorId';
      const error = new Error('Transaction error');
      systemRolesWithPermissions = [
        {
          id: 'role1',
          name: 'Role 1',
          description: 'Role 1 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 1, name: PermissionName.ManageBilling },
            { id: 2, name: PermissionName.ManageCompanyRoles },
          ],
        },
        {
          id: 'role2',
          name: 'Role 2',
          description: 'Role 2 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 3, name: PermissionName.ManageIntegrations },
            { id: 4, name: PermissionName.ManageIntegrationAssets },
          ],
        },
      ];

      const roleCreateArgs = systemRolesWithPermissions.map((role) => ({
        data: {
          name: role.name,
          description: role.description,
          companyId,
          creatorId,
          isEditable: false,
          permissions: {
            connect: role.permissions.map(({ id }) => ({ id })),
          },
        },
      }));

      jest
        .spyOn(
          mockCompanyRoleAndPermissionDbQueryBuilder,
          'buildCreateManySingleCompanyRolesQuery',
        )
        .mockReturnValue(roleCreateArgs);

      jest
        .spyOn(mockPrismaClientService.role, 'findMany')
        .mockResolvedValue(systemRolesWithPermissions);
      jest
        .spyOn(mockPrismaClientService, '$transaction')
        .mockRejectedValue(error);

      // Act & Assert
      const result = await service.initializeRoles(companyId, creatorId);
      expect(result).toBe(false);
      expect(mockLogService.error).toHaveBeenCalledWith(
        error.message,
        error.stack ? error.stack : 'Stack trace unavailable',
        {
          companyId,
          message: 'Company role initialization failed',
        },
      );
    });

    it('should verify that the logService.error method is called with the right arguments upon failure', async () => {
      // Arrange
      const companyId = 'testCompanyId';
      const creatorId = 'testCreatorId';
      const error = new Error('roleCreateArgs is empty');
      systemRolesWithPermissions = [
        {
          id: 'role1',
          name: 'Role 1',
          description: 'Role 1 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 1, name: PermissionName.ManageBilling },
            { id: 2, name: PermissionName.ManageCompanyRoles },
          ],
        },
        {
          id: 'role2',
          name: 'Role 2',
          description: 'Role 2 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 3, name: PermissionName.ManageIntegrations },
            { id: 4, name: PermissionName.ManageIntegrationAssets },
          ],
        },
      ];
      jest
        .spyOn(mockPrismaClientService.role, 'findMany')
        .mockResolvedValue(systemRolesWithPermissions);
      jest
        .spyOn(mockPrismaClientService, '$transaction')
        .mockRejectedValue(error);

      // Act & Assert
      await service.initializeRoles(companyId, creatorId);
      expect(mockLogService.error).toHaveBeenCalledWith(
        error.message,
        error.stack ? error.stack : 'Stack trace unavailable',
        {
          companyId,
          message: 'Company role initialization failed',
        },
      );
    });

    it('should not call prismaClient.$transaction if query builder returns empty array', async () => {
      // Arrange
      const companyId = 'testCompanyId';
      const creatorId = 'testCreatorId';
      systemRolesWithPermissions = [
        {
          id: 'role1',
          name: 'Role 1',
          description: 'Role 1 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 1, name: PermissionName.ManageBilling },
            { id: 2, name: PermissionName.ManageCompanyRoles },
          ],
        },
        {
          id: 'role2',
          name: 'Role 2',
          description: 'Role 2 description',
          companyId: null,
          creatorId: 'system',
          isEditable: true,
          permissions: [
            { id: 3, name: PermissionName.ManageIntegrations },
            { id: 4, name: PermissionName.ManageIntegrationAssets },
          ],
        },
      ];
      jest
        .spyOn(mockPrismaClientService.role, 'findMany')
        .mockResolvedValue(systemRolesWithPermissions);
      jest
        .spyOn(
          mockCompanyRoleAndPermissionDbQueryBuilder,
          'buildCreateManySingleCompanyRolesQuery',
        )
        .mockReturnValue([]);

      // Act
      await service.initializeRoles(companyId, creatorId);

      // Assert
      expect(mockPrismaClientService.$transaction).not.toHaveBeenCalled();
    });
  });
});
