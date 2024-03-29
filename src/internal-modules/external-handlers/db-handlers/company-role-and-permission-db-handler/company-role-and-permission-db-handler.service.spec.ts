import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleAndPermissionDbHandlerService } from './company-role-and-permission-db-handler.service';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockCompanyRoleAndPermissionDbQueryBuilder } from '../../../../../test/mocks/providers/mock_company_role_and_permission_db_querybuilder';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { LogService } from '../../../../system/modules/log/log.service';
import { mockLogService } from '../../../../../test/mocks/providers/mock_log_service';
import { $Enums, PermissionName, Prisma } from '@prisma/client';
import { IBuildCreateCompanyRoleArgs } from './interfaces/query-builder-args.interface';

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

  describe('createRole', () => {
    it('should create a company role with valid input', async () => {
      // Arrange
      const input: IBuildCreateCompanyRoleArgs = {
        name: 'Admin',
        description: 'Administrator role',
        companyId: 'company-1',
        creatorId: 'user-1',
      };

      // Act

      // Assert
    });

    it('should throw an error if the company role name is empty', async () => {
      // Arrange
      const input: IBuildCreateCompanyRoleArgs = {
        name: '',
        description: 'Administrator role',
        companyId: 'company-1',
        creatorId: 'user-1',
      };

      // Act

      // Assert
    });

    it('should return default description if default is empty', async () => {
      // Arrange
      const input: IBuildCreateCompanyRoleArgs = {
        name: 'Admin',
        description: '',
        companyId: 'company-1',
        creatorId: 'user-1',
      };

      // Act

      // Assert
    });

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct input', async () => {
      // Arrange
      const input: IBuildCreateCompanyRoleArgs = {
        name: 'Admin',
        description: 'Administrator role',
        companyId: 'company-1',
        creatorId: 'user-1',
      };

      // Act

      // Assert
    });

    it('should call the prismaClient.role.create method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {
      // Arrange
      const input: IBuildCreateCompanyRoleArgs = {
        name: 'Admin',
        description: 'Administrator role',
        companyId: 'company-1',
        creatorId: 'user-1',
      };

      // Act

      // Assert
    });

    it('should throw an error if the prismaClient.role.create method throws an error', async () => {
      // Arrange
      const input: IBuildCreateCompanyRoleArgs = {
        name: 'Admin',
        description: 'Administrator role',
        companyId: 'company-1',
        creatorId: 'user-1',
      };

      // Act

      // Assert
    });

    // Test that methods aren't called after errors
  });

  describe('retrieveRole', () => {
    it('should retrieve a company role by its ID', async () => {});

    it('should return null if the company role is not found', async () => {});

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role ID', async () => {});

    it('should call the prismaClient.role.findUnique method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {});

    it('should throw an error if the prismaClient.role.findUnique method throws an error', async () => {});

    it('should return the retrieved company role', async () => {});

    it('should retrieve a company role with all its associated permissions', async () => {});

    it('should retrieve a company role with its associated company details', async () => {});

    it('should retrieve a company role with its creator user details', async () => {});

    it('should retrieve a company role with its last modifier user details', async () => {});

    it('should retrieve a company role with its creation and modification timestamps', async () => {});
  });

  describe('editRole', () => {
    it('should update a company role with valid input', async () => {});

    it('should throw an error if id is not a valid uuid');

    it('should update the company role name', async () => {});

    it('should update the company role description', async () => {});

    it('should update the company role name and description simultaneously', async () => {});

    it('should not update the company role if no updates are provided', async () => {});

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role ID and updates', async () => {});

    it('should call the prismaClient.role.update method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {});

    it('should throw an error if the prismaClient.role.update method throws an error', async () => {});

    // Eyes
    it('should update the company role last modifier user ID', async () => {});

    it('should update the company role modification timestamp', async () => {});

    it('should not update the company role creator user ID', async () => {});

    it('should not update the company role creation timestamp', async () => {});

    it('should not update the company role associated permissions', async () => {});

    it('should not update the company role associated company details', async () => {});
  });

  describe('deleteRoles', () => {
    it('should delete a single company role when provided with a single role ID', async () => {});

    it('should delete multiple company roles when provided with multiple role IDs', async () => {});

    it('should throw an error if the role IDs array is empty', async () => {});

    it('should throw an error if the company ID is not a valid uuid', async () => {});

    it('should remove empty string role ids', async () => {});

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role ID and company ID when deleting a single role', async () => {});

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role IDs and company ID when deleting multiple roles', async () => {});

    it('should call the prismaClient.role.delete method with the query returned by the companyRoleAndPermissionDbQueryBuilder when deleting a single role', async () => {});

    it('should call the prismaClient.role.deleteMany method with the query returned by the companyRoleAndPermissionDbQueryBuilder when deleting multiple roles', async () => {});

    it('should throw an error if the prismaClient.role.delete method throws an error when deleting a single role', async () => {});

    it('should throw an error if the prismaClient.role.deleteMany method throws an error when deleting multiple roles', async () => {});

    it('should return the deleted company role when deleting a single role', async () => {});

    it('should return the number of deleted company roles when deleting multiple roles', async () => {});

    it('should delete the associated permissions of the deleted company roles', async () => {});
  });

  describe('addRolesToUser', () => {
    it('should add multiple roles to a user', async () => {});

    it('should throw an error if the role IDs array is empty', async () => {});

    it('should handle empty string role ids', async () => {});

    it('should throw an error if the user ID is empty', async () => {});

    it('should throw an error if the user ID is not a valid uuid', async () => {});

    it('should throw an error if the company ID is empty', async () => {});

    it('should throw an error if the company ID is not a valid uuid', async () => {});

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role IDs, user ID, company ID, and creator ID', async () => {});

    it('should call the prismaClient.userCompanyRole.createMany method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {});

    it('should throw an error if the prismaClient.userCompanyRole.createMany method throws an error', async () => {});

    it('should return the result of adding the roles to the user', async () => {});

    it('should create the user-role associations with the correct creation timestamps', async () => {});

    it('should not create duplicate user-role associations if they already exist', async () => {});
  });

  describe('removeRolesFromUser', () => {
    it('should remove multiple roles from a user', async () => {});

    it('should throw an error if the role IDs array is empty', async () => {});

    it('should handle empty string role ids', async () => {});

    it('should throw an error if the user ID is empty', async () => {});

    it('should throw an error if the user ID is not a valid UUID', async () => {});

    it('should throw an error if the company ID is empty', async () => {});

    it('should throw an error if the company ID is not a valid UUID', async () => {});

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role IDs, user ID, and company ID', async () => {});

    it('should call the prismaClient.userCompanyRole.deleteMany method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {});

    it('should throw an error if the prismaClient.userCompanyRole.deleteMany method throws an error', async () => {});

    it('should return the result of removing the roles from the user', async () => {});

    it('should remove all the specified user-role associations', async () => {});

    it('should not throw an error if the specified user-role associations do not exist', async () => {});

    it('should not remove user-role associations that are not specified', async () => {});

    it('should not remove user-role associations from other users', async () => {});

    it('should not remove user-role associations from other companies', async () => {});
  });

  describe('checkUserPermission', () => {
    it('should return true if the user has the specified permission', async () => {});

    it('should return false if the user does not have the specified permission', async () => {});

    it('should throw an error if the user ID is empty', async () => {});

    it('should throw an error if the user ID is not a valid UUID', async () => {});

    it('should throw an error if the company ID is empty', async () => {});

    it('should throw an error if the company ID is not a valid UUID', async () => {});

    it('should throw an error if the permission name is empty', async () => {});

    it('should throw an error if the permission name is not a valid enum value', async () => {});

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct user ID, company ID, and permission name', async () => {});

    it('should call the prismaClient.userCompanyRole.findFirst method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {});

    it('should throw an error if the prismaClient.userCompanyRole.findFirst method throws an error', async () => {});

    it('should return false if the user does not have any roles in the company', async () => {});

    it('should return false if the user has roles in the company but none of them have the specified permission', async () => {});

    it('should return true if the user has at least one role in the company with the specified permission', async () => {});

    it('should not check permissions for other users', async () => {});

    it('should not check permissions for other companies', async () => {});
  });

  describe('retrieveSelectUserPermissions', () => {
    it('should return a set of permissions that the user has', async () => {});

    it('should return an empty set if the user does not have any of the specified permissions', async () => {});

    it('should throw an error if the user ID is empty', async () => {});

    it('should throw an error if the user ID is not a valid UUID', async () => {});

    it('should throw an error if the company ID is empty', async () => {});

    it('should throw an error if the company ID is not a valid UUID', async () => {});

    it('should throw an error if the permissions array is empty', async () => {});

    it('should throw an error if any of the permission names are empty', async () => {});

    it('should throw an error if any of the permission names are not valid enum values', async () => {});

    it('should call the prismaClient.userCompanyRole.findMany method with the correct query', async () => {});

    it('should throw an error if the prismaClient.userCompanyRole.findMany method throws an error', async () => {});

    it('should return a set containing only the specified permissions that the user has', async () => {});

    it('should not include duplicate permissions in the returned set', async () => {});

    it('should not include permissions that the user does not have', async () => {});

    it('should not include permissions from other users', async () => {});

    it('should not include permissions from other companies', async () => {});

    it('should handle the case when the user has multiple roles with overlapping permissions', async () => {});
  });
});
