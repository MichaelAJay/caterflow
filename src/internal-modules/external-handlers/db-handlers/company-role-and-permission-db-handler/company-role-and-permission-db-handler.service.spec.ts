import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleAndPermissionDbHandlerService } from './company-role-and-permission-db-handler.service';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { PrismaClientService } from '../../../../external-modules/prisma-client/prisma-client.service';
import { mockCompanyRoleAndPermissionDbQueryBuilder } from '../../../../../test/mocks/providers/mock_company_role_and_permission_db_querybuilder';
import { mockPrismaClientService } from '../../../../../test/mocks/providers/mock_prisma_client';
import { LogService } from '../../../../system/modules/log/log.service';
import { mockLogService } from '../../../../../test/mocks/providers/mock_log_service';
import { $Enums, PermissionName, Prisma } from '@prisma/client';
import uuidUtils from '../../../../utility/functions/uuid-utils';
import { InvalidUUIDError } from '../../../../common/errors/invalid_uuid.error';
import {
  IBuildCreateCompanyRoleArgs,
  IBuildUpdateCompanyRoleArgs,
} from './interfaces/query-builder-args.interface';

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

    jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(true);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined along with its dependencies', () => {
    expect(service).toBeDefined();
    expect(companyRoleAndPermissionDbQueryBuilder).toBeDefined();
    expect(prismaClient).toBeDefined();
    expect(logService).toBeDefined();
  });

  describe('initializeRolesAndAssignOwner', () => {
    const validCompanyId = '00000000-0000-4000-8000-000000000000';
    const validCreatorId = '11111111-1111-4111-8111-111111111111';

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

    /**
     * Happy path:
     * prismaClient.role.findMany
     * companyRoleAndPermissionDbQueryBuilder.buildCreateManySingleCompanyRolesQuery
     * prismaClient.$transaction
     *  prismaClient.role.create
     * prismaClient.userCompanyRole.create
     *  companyRoleAndPermissionDbQueryBuilder.buildCreateUserCompanyRoleQuery
     */

    it('should successfully initialize roles with permissions for a new company and return true', async () => {
      // Arrange
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
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

      const ownerRecord = {
        id: '1',
        name: 'Owner',
        description: '',
        companyId: null,
        creatorId: '1',
        isEditable: true,
      };
      const mockTransactionReturn = [
        ownerRecord,
        {
          id: '2',
          name: 'Super Administrator',
          description: '',
          companyId: null,
          creatorId: '1',
          isEditable: true,
        },
        {
          id: '3',
          name: 'Administrator',
          description: '',
          companyId: null,
          creatorId: '1',
          isEditable: true,
        },
      ];
      jest
        .spyOn(prismaClient, '$transaction')
        .mockResolvedValue(mockTransactionReturn);

      const createUserCompanyRoleQueryReturn = {
        data: {
          roleId: ownerRecord.id,
          userId: validCreatorId,
          companyId: validCompanyId,
          creatorId: validCreatorId,
        },
      };
      const createUCRQueryBuilderSpy = jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildCreateUserCompanyRoleQuery',
        )
        .mockReturnValue(createUserCompanyRoleQueryReturn);

      // Act
      const result = await service.initializeRolesAndAssignOwner(
        companyId,
        creatorId,
      );

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
      expect(createUCRQueryBuilderSpy).toHaveBeenCalledWith(
        ownerRecord.id,
        validCreatorId,
        validCompanyId,
      );
      expect(prismaClient.userCompanyRole.create).toHaveBeenCalledWith(
        createUserCompanyRoleQueryReturn,
      );
    });

    it('should not call log service if InvalidUUIDError is thrown', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.initializeRolesAndAssignOwner('', ''),
      ).rejects.toThrow(InvalidUUIDError);

      expect(logService.error).not.toHaveBeenCalled();
    });

    it('should not call any other mehtods if InvalidUUIDError is thrown', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.initializeRolesAndAssignOwner('', ''),
      ).rejects.toThrow(InvalidUUIDError);

      expect(prismaClient.role.findMany).not.toHaveBeenCalled();
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateManySingleCompanyRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.$transaction).not.toHaveBeenCalled();
      expect(prismaClient.role.create).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.create).not.toHaveBeenCalled();
    });

    it('should throw invalid uuid error if companyId is empty and only call isUUID once with companyId', async () => {
      const companyId = '';
      const creatorId = '';

      const spy = jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);
      await expect(
        service.initializeRolesAndAssignOwner(companyId, creatorId),
      ).rejects.toThrow(InvalidUUIDError);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(companyId);
    });

    it('should throw invalid uuid error if companyId is not valid uuid and only call isUUID once with companyId', async () => {
      const companyId = 'invalid-id';
      const creatorId = '';

      const spy = jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);
      await expect(
        service.initializeRolesAndAssignOwner(companyId, creatorId),
      ).rejects.toThrow(InvalidUUIDError);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(companyId);
    });

    it('should throw invalid uuid error if creatorId is empty and call isUUID twice', async () => {
      const companyId = validCompanyId;
      const creatorId = '';

      const spy = jest
        .spyOn(uuidUtils, 'isUUID')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      await expect(
        service.initializeRolesAndAssignOwner(companyId, creatorId),
      ).rejects.toThrow(InvalidUUIDError);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(companyId);
      expect(spy).toHaveBeenCalledWith(creatorId);
    });

    it('should throw invalid uuid error if creatorId is not valid uuid and call isUUID twice', async () => {
      const companyId = validCompanyId;
      const creatorId = 'invalid id';

      const spy = jest
        .spyOn(uuidUtils, 'isUUID')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      await expect(
        service.initializeRolesAndAssignOwner(companyId, creatorId),
      ).rejects.toThrow(InvalidUUIDError);

      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith(companyId);
      expect(spy).toHaveBeenCalledWith(creatorId);
    });

    it('should call Prisma client findMany with correct parameters', async () => {
      // Arrange
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
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
      await service.initializeRolesAndAssignOwner(companyId, creatorId);

      // Assert
      expect(mockPrismaClientService.role.findMany).toHaveBeenCalledWith({
        where: { companyId: null },
        include: { permissions: true },
      });
    });

    it('should call buildCreateManySingleCompanyRolesQuery with correct parameters', async () => {
      // Arrange
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
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
      await service.initializeRolesAndAssignOwner(companyId, creatorId);

      // Assert
      expect(
        mockCompanyRoleAndPermissionDbQueryBuilder.buildCreateManySingleCompanyRolesQuery,
      ).toHaveBeenCalledWith(systemRolesWithPermissions, companyId, creatorId);
    });

    it('should call prismaService.$transaction with correct parameters', async () => {
      // Arrange
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
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
      await service.initializeRolesAndAssignOwner(companyId, creatorId);

      // Assert
      expect(mockPrismaClientService.$transaction).toHaveBeenCalledWith(
        roleCreateArgs.map((roleCreateArg) =>
          mockPrismaClientService.role.create(roleCreateArg),
        ),
      );
    });

    it('should execute a transaction with the correct number of create operations', async () => {
      // Arrange
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
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
      await service.initializeRolesAndAssignOwner(companyId, creatorId);

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
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
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
      const result = await service.initializeRolesAndAssignOwner(
        companyId,
        creatorId,
      );

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
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
      const error = new Error('findMany error');
      jest
        .spyOn(mockPrismaClientService.role, 'findMany')
        .mockRejectedValue(error);

      // Act & Assert
      const result = await service.initializeRolesAndAssignOwner(
        companyId,
        creatorId,
      );

      expect(result).toBe(false);
      expect(mockLogService.error).toHaveBeenCalledWith(
        error.message,
        error.stack ? error.stack : 'Stack trace unavailable',
        {
          companyId,
          message: 'Company role initialization failed',
        },
      );
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateManySingleCompanyRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.$transaction).not.toHaveBeenCalled();
      expect(prismaClient.role.create).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.create).not.toHaveBeenCalled();
    });

    it('should return false and log an error and rethrow it when an error occurs during the transaction', async () => {
      // Arrange
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
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
      const result = await service.initializeRolesAndAssignOwner(
        companyId,
        creatorId,
      );
      expect(result).toBe(false);
      expect(mockLogService.error).toHaveBeenCalledWith(
        error.message,
        error.stack ? error.stack : 'Stack trace unavailable',
        {
          companyId,
          message: 'Company role initialization failed',
        },
      );
      expect(prismaClient.userCompanyRole.create).not.toHaveBeenCalled();
    });

    it('should return false and log an error and rethrow it when an error occurs during userCompanyRole.create', async () => {
      // Arrange
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
      const error = new Error('Database error');
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

      const ownerRecord = {
        id: '1',
        name: 'Owner',
        description: '',
        companyId: null,
        creatorId: '1',
        isEditable: true,
      };
      const mockTransactionReturn = [
        ownerRecord,
        {
          id: '2',
          name: 'Super Administrator',
          description: '',
          companyId: null,
          creatorId: '1',
          isEditable: true,
        },
        {
          id: '3',
          name: 'Administrator',
          description: '',
          companyId: null,
          creatorId: '1',
          isEditable: true,
        },
      ];

      jest
        .spyOn(mockPrismaClientService, '$transaction')
        .mockResolvedValue(mockTransactionReturn);
      jest
        .spyOn(mockPrismaClientService.userCompanyRole, 'create')
        .mockRejectedValue(error);

      // Act & Assert
      const result = await service.initializeRolesAndAssignOwner(
        companyId,
        creatorId,
      );
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
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
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
      await service.initializeRolesAndAssignOwner(companyId, creatorId);
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
      const companyId = validCompanyId;
      const creatorId = validCreatorId;
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
      await service.initializeRolesAndAssignOwner(companyId, creatorId);

      // Assert
      expect(mockPrismaClientService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('createRole', () => {
    const validInput: IBuildCreateCompanyRoleArgs = {
      name: 'Role Name',
      description: 'Role Description',
      companyId: '00000000-0000-4000-8000-000000000000',
      creatorId: '11111111-1111-4111-8111-111111111111',
    };

    it('should create a company role with valid input', async () => {
      const queryBuilderReturn = {
        key: 'value',
      } as unknown as Prisma.RoleCreateArgs;
      const queryBuilderSpy = jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildCreateCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.createRole(validInput);

      expect(queryBuilderSpy).toHaveBeenCalledWith(validInput);
      expect(prismaClient.role.create).toHaveBeenCalledWith(queryBuilderReturn);
    });

    it('should throw an InvalidUUIDError if companyId is empty and only call isUUID once with companyId', async () => {
      const invalidInput = { ...validInput, companyId: '' };

      const isUUIDSpy = jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(service.createRole(invalidInput)).rejects.toThrow(
        InvalidUUIDError,
      );
      expect(isUUIDSpy).toHaveBeenCalledTimes(1);
      expect(isUUIDSpy).toHaveBeenCalledWith(invalidInput.companyId);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateCompanyRoleQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.create).not.toHaveBeenCalled();
    });

    it('should throw an InvalidUUIDError if companyId is not a valid UUID and only call isUUID once with companyId', async () => {
      const isUUIDSpy = jest
        .spyOn(uuidUtils, 'isUUID')
        .mockReturnValueOnce(false);
      const invalidInput = { ...validInput, companyId: 'invalid-uuid' };
      await expect(service.createRole(invalidInput)).rejects.toThrow(
        InvalidUUIDError,
      );
      expect(isUUIDSpy).toHaveBeenCalledTimes(1);
      expect(isUUIDSpy).toHaveBeenCalledWith(invalidInput.companyId);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateCompanyRoleQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.create).not.toHaveBeenCalled();
    });

    it('should throw an InvalidUUIDError if creatorId is empty and call isUUID twice', async () => {
      const invalidInput = { ...validInput, creatorId: '' };

      const isUUIDSpy = jest
        .spyOn(uuidUtils, 'isUUID')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      await expect(service.createRole(invalidInput)).rejects.toThrow(
        InvalidUUIDError,
      );
      expect(isUUIDSpy).toHaveBeenCalledTimes(2);
      expect(isUUIDSpy).toHaveBeenNthCalledWith(1, invalidInput.companyId);
      expect(isUUIDSpy).toHaveBeenNthCalledWith(2, invalidInput.creatorId);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateCompanyRoleQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.create).not.toHaveBeenCalled();
    });

    it('should throw an InvalidUUIDError if creatorId is not a valid UUID and call isUUID twice', async () => {
      const isUUIDSpy = jest
        .spyOn(uuidUtils, 'isUUID')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);
      const invalidInput = { ...validInput, creatorId: 'invalid-uuid' };
      await expect(service.createRole(invalidInput)).rejects.toThrow(
        InvalidUUIDError,
      );
      expect(isUUIDSpy).toHaveBeenCalledTimes(2);
      expect(isUUIDSpy).toHaveBeenNthCalledWith(1, invalidInput.companyId);
      expect(isUUIDSpy).toHaveBeenNthCalledWith(2, invalidInput.creatorId);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateCompanyRoleQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.create).not.toHaveBeenCalled();
    });

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct input', async () => {
      const queryBuilderReturn = {
        key: 'value',
      } as unknown as Prisma.RoleCreateArgs;
      const queryBuilderSpy = jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildCreateCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.createRole(validInput);

      expect(queryBuilderSpy).toHaveBeenCalledWith(validInput);
    });

    it('should call the prismaClient.role.create method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {
      const queryBuilderReturn = {
        key: 'value',
      } as unknown as Prisma.RoleCreateArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildCreateCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.createRole(validInput);

      expect(prismaClient.role.create).toHaveBeenCalledWith(queryBuilderReturn);
    });

    it('should throw an error if the prismaClient.role.create method throws an error', async () => {
      const queryBuilderReturn = {
        key: 'value',
      } as unknown as Prisma.RoleCreateArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildCreateCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.role, 'create')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.createRole(validInput)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('retrieveRole', () => {
    const validRoleId = '00000000-0000-4000-8000-000000000000';
    it('should retrieve a company role by its ID', async () => {
      const role = { id: validRoleId, name: 'Role Name' };
      const queryBuilderReturn = {
        where: { id: validRoleId },
      } as unknown as Prisma.RoleFindUniqueArgs;
      jest
        .spyOn(companyRoleAndPermissionDbQueryBuilder, 'buildRetrieveRoleQuery')
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.role, 'findUnique')
        .mockResolvedValue(role as any);

      const result = await service.retrieveRole(validRoleId);

      expect(result).toEqual(role);
    });

    it('should return null if the company role is not found', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId },
      } as unknown as Prisma.RoleFindUniqueArgs;
      jest
        .spyOn(companyRoleAndPermissionDbQueryBuilder, 'buildRetrieveRoleQuery')
        .mockReturnValue(queryBuilderReturn);
      jest.spyOn(prismaClient.role, 'findUnique').mockResolvedValue(null);

      const result = await service.retrieveRole(validRoleId);

      expect(result).toBeNull();
    });

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role ID', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId },
      } as unknown as Prisma.RoleFindUniqueArgs;
      const queryBuilderSpy = jest
        .spyOn(companyRoleAndPermissionDbQueryBuilder, 'buildRetrieveRoleQuery')
        .mockReturnValue(queryBuilderReturn);

      await service.retrieveRole(validRoleId);

      expect(queryBuilderSpy).toHaveBeenCalledWith(validRoleId);
    });

    it('should call the prismaClient.role.findUnique method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId },
      } as unknown as Prisma.RoleFindUniqueArgs;
      jest
        .spyOn(companyRoleAndPermissionDbQueryBuilder, 'buildRetrieveRoleQuery')
        .mockReturnValue(queryBuilderReturn);

      await service.retrieveRole(validRoleId);

      expect(prismaClient.role.findUnique).toHaveBeenCalledWith(
        queryBuilderReturn,
      );
    });

    it('should throw an InvalidUUIDError if the role ID is the empty string', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(service.retrieveRole('')).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildRetrieveRoleQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.findUnique).not.toHaveBeenCalled();
    });

    it('should throw an InvalidUUIDError if the role ID is not a valid UUID', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(service.retrieveRole('invalid-role-id')).rejects.toThrow(
        InvalidUUIDError,
      );
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildRetrieveRoleQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.findUnique).not.toHaveBeenCalled();
    });

    it('should throw an error if the prismaClient.role.findUnique method throws an error', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId },
      } as unknown as Prisma.RoleFindUniqueArgs;
      jest
        .spyOn(companyRoleAndPermissionDbQueryBuilder, 'buildRetrieveRoleQuery')
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.role, 'findUnique')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.retrieveRole(validRoleId)).rejects.toThrow(
        'Database error',
      );
    });

    it('should return the retrieved company role', async () => {
      const role = { id: validRoleId, name: 'Role Name' };
      const queryBuilderReturn = {
        where: { id: validRoleId },
      } as unknown as Prisma.RoleFindUniqueArgs;
      jest
        .spyOn(companyRoleAndPermissionDbQueryBuilder, 'buildRetrieveRoleQuery')
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.role, 'findUnique')
        .mockResolvedValue(role as any);

      const result = await service.retrieveRole(validRoleId);

      expect(result).toEqual(role);
    });

    // This test is not true - the method doesn't do that. But maybe it should.
    // it('should retrieve a company role with all its associated permissions', async () => {
    //   const role = {
    //     id: validRoleId,
    //     name: 'Role Name',
    //     permissions: [
    //       { id: 'permission-1', name: 'Permission 1' },
    //       { id: 'permission-2', name: 'Permission 2' },
    //     ],
    //   };
    //   const queryBuilderReturn = {
    //     where: { id: validRoleId },
    //     include: { permissions: true },
    //   } as unknown as Prisma.RoleFindUniqueArgs;
    //   jest
    //     .spyOn(companyRoleAndPermissionDbQueryBuilder, 'buildRetrieveRoleQuery')
    //     .mockReturnValue(queryBuilderReturn);
    //   jest
    //     .spyOn(prismaClient.role, 'findUnique')
    //     .mockResolvedValue(role as any);

    //   const result = await service.retrieveRole(validRoleId);

    //   expect(result).toEqual(role);
    // });
  });

  describe('editRole', () => {
    const validRoleId = '00000000-0000-4000-8000-000000000000';
    const invalidRoleId = 'invalid-uuid';
    const validUpdates: IBuildUpdateCompanyRoleArgs = {
      name: 'Updated Role Name',
      description: 'Updated Role Description',
    };

    it('should update a company role with valid input', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId },
        data: validUpdates,
      } as unknown as Prisma.RoleUpdateArgs;
      const queryBuilderSpy = jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildUpdateCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.editRole(validRoleId, validUpdates);

      expect(queryBuilderSpy).toHaveBeenCalledWith(validRoleId, validUpdates);
      expect(prismaClient.role.update).toHaveBeenCalledWith(queryBuilderReturn);
    });

    it('should throw an error if id is not a valid uuid', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.editRole(invalidRoleId, validUpdates),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildUpdateCompanyRoleQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.update).not.toHaveBeenCalled();
    });

    it('should update the company role name', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId },
        data: { name: validUpdates.name },
      } as unknown as Prisma.RoleUpdateArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildUpdateCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.editRole(validRoleId, { name: validUpdates.name });

      expect(prismaClient.role.update).toHaveBeenCalledWith(queryBuilderReturn);
    });

    it('should update the company role description', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId },
        data: { description: validUpdates.description },
      } as unknown as Prisma.RoleUpdateArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildUpdateCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.editRole(validRoleId, {
        description: validUpdates.description,
      });

      expect(prismaClient.role.update).toHaveBeenCalledWith(queryBuilderReturn);
    });

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role ID and updates', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId },
        data: validUpdates,
      } as unknown as Prisma.RoleUpdateArgs;
      const queryBuilderSpy = jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildUpdateCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.editRole(validRoleId, validUpdates);

      expect(queryBuilderSpy).toHaveBeenCalledWith(validRoleId, validUpdates);
    });

    it('should call the prismaClient.role.update method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId },
        data: validUpdates,
      } as unknown as Prisma.RoleUpdateArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildUpdateCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.editRole(validRoleId, validUpdates);

      expect(prismaClient.role.update).toHaveBeenCalledWith(queryBuilderReturn);
    });

    it('should propagate any error thrown by prismaClient.role.update', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId },
        data: validUpdates,
      } as unknown as Prisma.RoleUpdateArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildUpdateCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.role, 'update')
        .mockRejectedValue(new Error('Database error'));

      await expect(service.editRole(validRoleId, validUpdates)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('deleteRoles', () => {
    const validRoleId = '00000000-0000-4000-8000-000000000000';
    const anotherValidRoleId = '00000000-0000-4000-8000-000000000001';
    const validCompanyId = '11111111-1111-4111-8111-111111111111';
    const invalidCompanyId = 'invalid-company-uuid';

    it('should delete a single company role when provided with a single role ID', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId, companyId: validCompanyId },
      } as unknown as Prisma.RoleDeleteArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.deleteRoles([validRoleId], validCompanyId);

      expect(prismaClient.role.delete).toHaveBeenCalledWith(queryBuilderReturn);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteManyCompanyRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.deleteMany).not.toHaveBeenCalled();
    });

    it('should delete multiple company roles when provided with multiple role IDs', async () => {
      const roleIds = [validRoleId, anotherValidRoleId];
      const queryBuilderReturn = {
        where: { id: { in: roleIds }, companyId: validCompanyId },
      } as unknown as Prisma.RoleDeleteManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteManyCompanyRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.deleteRoles(roleIds, validCompanyId);

      expect(prismaClient.role.deleteMany).toHaveBeenCalledWith(
        queryBuilderReturn,
      );
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteCompanyRoleQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.delete).not.toHaveBeenCalled();
    });

    it('should throw an error if the role IDs array is empty', async () => {
      await expect(service.deleteRoles([], validCompanyId)).rejects.toThrow(
        'ids array may not be empty',
      );
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteCompanyRoleQuery,
      ).not.toHaveBeenCalled();
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteManyCompanyRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.delete).not.toHaveBeenCalled();
      expect(prismaClient.role.deleteMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the company ID is not a valid uuid', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.deleteRoles([validRoleId], invalidCompanyId),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteCompanyRoleQuery,
      ).not.toHaveBeenCalled();
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteManyCompanyRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.role.delete).not.toHaveBeenCalled();
      expect(prismaClient.role.deleteMany).not.toHaveBeenCalled();
    });

    it('should throw InvalidUUIDError if roleIds includes an empty string element', async () => {
      const roleIds = [validRoleId, ''];
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.deleteRoles(roleIds, validCompanyId),
      ).rejects.toThrow(InvalidUUIDError);
    });

    it('should throw InvalidUUIDError if roleIds includes an element which is not a uuid', async () => {
      const roleIds = [validRoleId, 'not-uuid'];
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.deleteRoles(roleIds, validCompanyId),
      ).rejects.toThrow(InvalidUUIDError);
    });

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role ID and company ID when deleting a single role', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId, companyId: validCompanyId },
      } as unknown as Prisma.RoleDeleteArgs;
      const queryBuilderSpy = jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.deleteRoles([validRoleId], validCompanyId);

      expect(queryBuilderSpy).toHaveBeenCalledWith(validRoleId, validCompanyId);
    });

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role IDs and company ID when deleting multiple roles', async () => {
      const roleIds = [validRoleId, anotherValidRoleId];
      const queryBuilderReturn = {
        where: { id: { in: roleIds }, companyId: validCompanyId },
      } as unknown as Prisma.RoleDeleteManyArgs;
      const queryBuilderSpy = jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteManyCompanyRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.deleteRoles(roleIds, validCompanyId);

      expect(queryBuilderSpy).toHaveBeenCalledWith(roleIds, validCompanyId);
    });

    it('should call the prismaClient.role.delete method with the query returned by the companyRoleAndPermissionDbQueryBuilder when deleting a single role', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId, companyId: validCompanyId },
      } as unknown as Prisma.RoleDeleteArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.deleteRoles([validRoleId], validCompanyId);

      expect(prismaClient.role.delete).toHaveBeenCalledWith(queryBuilderReturn);
    });

    it('should call the prismaClient.role.deleteMany method with the query returned by the companyRoleAndPermissionDbQueryBuilder when deleting multiple roles', async () => {
      const roleIds = [validRoleId, 'another-valid-uuid'];
      const queryBuilderReturn = {
        where: { id: { in: roleIds }, companyId: validCompanyId },
      } as unknown as Prisma.RoleDeleteManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteManyCompanyRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.deleteRoles(roleIds, validCompanyId);

      expect(prismaClient.role.deleteMany).toHaveBeenCalledWith(
        queryBuilderReturn,
      );
    });

    it('should throw an error if the prismaClient.role.delete method throws an error when deleting a single role', async () => {
      const queryBuilderReturn = {
        where: { id: validRoleId, companyId: validCompanyId },
      } as unknown as Prisma.RoleDeleteArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteCompanyRoleQuery',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.role, 'delete')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.deleteRoles([validRoleId], validCompanyId),
      ).rejects.toThrow('Database error');
    });

    it('should throw an error if the prismaClient.role.deleteMany method throws an error when deleting multiple roles', async () => {
      const roleIds = [validRoleId, 'another-valid-uuid'];
      const queryBuilderReturn = {
        where: { id: { in: roleIds }, companyId: validCompanyId },
      } as unknown as Prisma.RoleDeleteManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteManyCompanyRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.role, 'deleteMany')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.deleteRoles(roleIds, validCompanyId),
      ).rejects.toThrow('Database error');
    });
  });

  describe('addRolesToUser', () => {
    const validRoleIds = [
      '00000000-0000-4000-8000-000000000000',
      '00000000-0000-4000-8000-000000000001',
    ];
    const validUserId = '11111111-1111-4111-8111-111111111111';
    const validCompanyId = '11111111-1111-4111-8111-111111111112';
    const validCreatorId = '11111111-1111-4111-8111-1111111111113';
    const invalidUserId = 'invalid-user-uuid';
    const invalidCompanyId = 'invalid-company-uuid';

    it('should add multiple roles to a user', async () => {
      const queryBuilderReturn = {
        data: [
          {
            roleId: validRoleIds[0],
            userId: validUserId,
            companyId: validCompanyId,
            createdBy: validCreatorId,
          },
          {
            roleId: validRoleIds[1],
            userId: validUserId,
            companyId: validCompanyId,
            createdBy: validCreatorId,
          },
        ],
      } as unknown as Prisma.UserCompanyRoleCreateManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildCreateManyCompanyUserRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.addRolesToUser(
        validRoleIds,
        validUserId,
        validCompanyId,
        validCreatorId,
      );

      expect(prismaClient.userCompanyRole.createMany).toHaveBeenCalledWith(
        queryBuilderReturn,
      );
    });

    it('should throw an error if the role IDs array is empty', async () => {
      await expect(
        service.addRolesToUser([], validUserId, validCompanyId, validCreatorId),
      ).rejects.toThrow('role ids array may not be empty');
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.createMany).not.toHaveBeenCalled();
    });

    it('should handle empty string role ids', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);
      await expect(
        service.addRolesToUser(
          [validRoleIds[0], ''],
          validUserId,
          validCompanyId,
          validCreatorId,
        ),
      ).rejects.toThrow(InvalidUUIDError);

      expect(prismaClient.userCompanyRole.createMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the user ID is empty', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.addRolesToUser(
          validRoleIds,
          '',
          validCompanyId,
          validCreatorId,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.createMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the user ID is not a valid uuid', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);
      await expect(
        service.addRolesToUser(
          validRoleIds,
          invalidUserId,
          validCompanyId,
          validCreatorId,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.createMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the company ID is empty', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);
      await expect(
        service.addRolesToUser(validRoleIds, validUserId, '', validCreatorId),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.createMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the company ID is not a valid uuid', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);
      await expect(
        service.addRolesToUser(
          validRoleIds,
          validUserId,
          invalidCompanyId,
          validCreatorId,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.createMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the creator ID is empty', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);
      await expect(
        service.addRolesToUser(validRoleIds, validUserId, validCompanyId, ''),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.createMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the creator ID is not a valid uuid', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);
      await expect(
        service.addRolesToUser(
          validRoleIds,
          validUserId,
          validCompanyId,
          'invalid-id',
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildCreateManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.createMany).not.toHaveBeenCalled();
    });

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role IDs, user ID, company ID, and creator ID', async () => {
      const queryBuilderReturn = {
        data: [
          {
            roleId: validRoleIds[0],
            userId: validUserId,
            companyId: validCompanyId,
            createdBy: validCreatorId,
          },
          {
            roleId: validRoleIds[1],
            userId: validUserId,
            companyId: validCompanyId,
            createdBy: validCreatorId,
          },
        ],
      } as unknown as Prisma.UserCompanyRoleCreateManyArgs;
      const queryBuilderSpy = jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildCreateManyCompanyUserRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.addRolesToUser(
        validRoleIds,
        validUserId,
        validCompanyId,
        validCreatorId,
      );

      expect(queryBuilderSpy).toHaveBeenCalledWith(
        validRoleIds,
        validUserId,
        validCompanyId,
        validCreatorId,
      );
    });

    it('should call the prismaClient.userCompanyRole.createMany method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {
      const queryBuilderReturn = {
        data: [
          {
            roleId: validRoleIds[0],
            userId: validUserId,
            companyId: validCompanyId,
            createdBy: validCreatorId,
          },
          {
            roleId: validRoleIds[1],
            userId: validUserId,
            companyId: validCompanyId,
            createdBy: validCreatorId,
          },
        ],
      } as unknown as Prisma.UserCompanyRoleCreateManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildCreateManyCompanyUserRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.addRolesToUser(
        validRoleIds,
        validUserId,
        validCompanyId,
        validCreatorId,
      );

      expect(prismaClient.userCompanyRole.createMany).toHaveBeenCalledWith(
        queryBuilderReturn,
      );
    });

    it('should throw an error if the prismaClient.userCompanyRole.createMany method throws an error', async () => {
      const queryBuilderReturn = {
        data: [
          {
            roleId: validRoleIds[0],
            userId: validUserId,
            companyId: validCompanyId,
            createdBy: validCreatorId,
          },
          {
            roleId: validRoleIds[1],
            userId: validUserId,
            companyId: validCompanyId,
            createdBy: validCreatorId,
          },
        ],
      } as unknown as Prisma.UserCompanyRoleCreateManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildCreateManyCompanyUserRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.userCompanyRole, 'createMany')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.addRolesToUser(
          validRoleIds,
          validUserId,
          validCompanyId,
          validCreatorId,
        ),
      ).rejects.toThrow('Database error');
    });

    it('should return the result of adding the roles to the user', async () => {
      const createManyResult = { count: validRoleIds.length };
      const queryBuilderReturn = {
        data: [
          {
            roleId: validRoleIds[0],
            userId: validUserId,
            companyId: validCompanyId,
            createdBy: validCreatorId,
          },
          {
            roleId: validRoleIds[1],
            userId: validUserId,
            companyId: validCompanyId,
            createdBy: validCreatorId,
          },
        ],
      } as unknown as Prisma.UserCompanyRoleCreateManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildCreateManyCompanyUserRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.userCompanyRole, 'createMany')
        .mockResolvedValue(createManyResult);

      const result = await service.addRolesToUser(
        validRoleIds,
        validUserId,
        validCompanyId,
        validCreatorId,
      );

      expect(result).toEqual(createManyResult);
    });
  });

  describe('removeRolesFromUser', () => {
    const validRoleIds = ['valid-role-1', 'valid-role-2'];
    const validUserId = 'valid-user-uuid';
    const validCompanyId = 'valid-company-uuid';
    const invalidUserId = 'invalid-user-uuid';
    const invalidCompanyId = 'invalid-company-uuid';
    it('should remove multiple roles from a user', async () => {
      const queryBuilderReturn = {
        where: {
          roleId: { in: validRoleIds },
          userId: validUserId,
          companyId: validCompanyId,
        },
      } as unknown as Prisma.UserCompanyRoleDeleteManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteManyCompanyUserRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.removeRolesFromUser(
        validRoleIds,
        validUserId,
        validCompanyId,
      );

      expect(prismaClient.userCompanyRole.deleteMany).toHaveBeenCalledWith(
        queryBuilderReturn,
      );
    });

    it('should throw an error if the role IDs array is empty', async () => {
      await expect(
        service.removeRolesFromUser([], validUserId, validCompanyId),
      ).rejects.toThrow('role ids array may not be empty');
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.deleteMany).not.toHaveBeenCalled();
    });

    it('should handle empty string role ids', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.removeRolesFromUser(
          [validRoleIds[0], ''],
          validUserId,
          validCompanyId,
        ),
      ).rejects.toThrow(InvalidUUIDError);

      expect(prismaClient.userCompanyRole.deleteMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the user ID is empty', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.removeRolesFromUser(validRoleIds, '', validCompanyId),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.deleteMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the user ID is not a valid UUID', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.removeRolesFromUser(
          validRoleIds,
          invalidUserId,
          validCompanyId,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.deleteMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the company ID is empty', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.removeRolesFromUser(validRoleIds, validUserId, ''),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.deleteMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the company ID is not a valid UUID', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.removeRolesFromUser(
          validRoleIds,
          validUserId,
          invalidCompanyId,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildDeleteManyCompanyUserRolesQuery,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.deleteMany).not.toHaveBeenCalled();
    });

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct role IDs, user ID, and company ID', async () => {
      const queryBuilderReturn = {
        where: {
          roleId: { in: validRoleIds },
          userId: validUserId,
          companyId: validCompanyId,
        },
      } as unknown as Prisma.UserCompanyRoleDeleteManyArgs;
      const queryBuilderSpy = jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteManyCompanyUserRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.removeRolesFromUser(
        validRoleIds,
        validUserId,
        validCompanyId,
      );

      expect(queryBuilderSpy).toHaveBeenCalledWith(
        validRoleIds,
        validUserId,
        validCompanyId,
      );
    });

    it('should call the prismaClient.userCompanyRole.deleteMany method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {
      const queryBuilderReturn = {
        where: {
          roleId: { in: validRoleIds },
          userId: validUserId,
          companyId: validCompanyId,
        },
      } as unknown as Prisma.UserCompanyRoleDeleteManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteManyCompanyUserRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.removeRolesFromUser(
        validRoleIds,
        validUserId,
        validCompanyId,
      );

      expect(prismaClient.userCompanyRole.deleteMany).toHaveBeenCalledWith(
        queryBuilderReturn,
      );
    });

    it('should throw an error if the prismaClient.userCompanyRole.deleteMany method throws an error', async () => {
      const queryBuilderReturn = {
        where: {
          roleId: { in: validRoleIds },
          userId: validUserId,
          companyId: validCompanyId,
        },
      } as unknown as Prisma.UserCompanyRoleDeleteManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteManyCompanyUserRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.userCompanyRole, 'deleteMany')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.removeRolesFromUser(validRoleIds, validUserId, validCompanyId),
      ).rejects.toThrow('Database error');
    });

    it('should return the result of removing the roles from the user', async () => {
      const deleteManyResult = { count: validRoleIds.length };
      const queryBuilderReturn = {
        where: {
          roleId: { in: validRoleIds },
          userId: validUserId,
          companyId: validCompanyId,
        },
      } as unknown as Prisma.UserCompanyRoleDeleteManyArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildDeleteManyCompanyUserRolesQuery',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.userCompanyRole, 'deleteMany')
        .mockResolvedValue(deleteManyResult);

      const result = await service.removeRolesFromUser(
        validRoleIds,
        validUserId,
        validCompanyId,
      );

      expect(result).toEqual(deleteManyResult);
    });
  });

  describe('checkUserPermission', () => {
    const validUserId = 'valid-user-uuid';
    const validCompanyId = 'valid-company-uuid';
    const validPermissionName = $Enums.PermissionName.ManageBilling;
    const invalidUserId = 'invalid-user-uuid';
    const invalidCompanyId = 'invalid-company-uuid';

    it('should return true if the user has the specified permission', async () => {
      const queryBuilderReturn = {
        where: {
          userId: validUserId,
          companyId: validCompanyId,
          role: {
            permissions: {
              some: {
                name: validPermissionName,
              },
            },
          },
        },
      } as unknown as Prisma.UserCompanyRoleFindFirstArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildFindFirstUserCompanyRoleWithPermission',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.userCompanyRole, 'findFirst')
        .mockResolvedValue({} as any);

      const result = await service.checkUserPermission(
        validUserId,
        validCompanyId,
        validPermissionName,
      );

      expect(result).toBe(true);
    });

    it('should return false if the user does not have the specified permission', async () => {
      const queryBuilderReturn = {
        where: {
          userId: validUserId,
          companyId: validCompanyId,
          role: {
            permissions: {
              some: {
                name: validPermissionName,
              },
            },
          },
        },
      } as unknown as Prisma.UserCompanyRoleFindFirstArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildFindFirstUserCompanyRoleWithPermission',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.userCompanyRole, 'findFirst')
        .mockResolvedValue(null);

      const result = await service.checkUserPermission(
        validUserId,
        validCompanyId,
        validPermissionName,
      );

      expect(result).toBe(false);
    });

    it('should throw an error if the user ID is empty', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.checkUserPermission('', validCompanyId, validPermissionName),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildFindFirstUserCompanyRoleWithPermission,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.findFirst).not.toHaveBeenCalled();
    });

    it('should throw an error if the user ID is not a valid UUID', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.checkUserPermission(
          invalidUserId,
          validCompanyId,
          validPermissionName,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildFindFirstUserCompanyRoleWithPermission,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.findFirst).not.toHaveBeenCalled();
    });

    it('should throw an error if the company ID is empty', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.checkUserPermission(validUserId, '', validPermissionName),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildFindFirstUserCompanyRoleWithPermission,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.findFirst).not.toHaveBeenCalled();
    });

    it('should throw an error if the company ID is not a valid UUID', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.checkUserPermission(
          validUserId,
          invalidCompanyId,
          validPermissionName,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(
        companyRoleAndPermissionDbQueryBuilder.buildFindFirstUserCompanyRoleWithPermission,
      ).not.toHaveBeenCalled();
      expect(prismaClient.userCompanyRole.findFirst).not.toHaveBeenCalled();
    });

    it('should call the companyRoleAndPermissionDbQueryBuilder with the correct user ID, company ID, and permission name', async () => {
      const queryBuilderReturn = {
        where: {
          userId: validUserId,
          companyId: validCompanyId,
          role: {
            permissions: {
              some: {
                name: validPermissionName,
              },
            },
          },
        },
      } as unknown as Prisma.UserCompanyRoleFindFirstArgs;
      const queryBuilderSpy = jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildFindFirstUserCompanyRoleWithPermission',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.checkUserPermission(
        validUserId,
        validCompanyId,
        validPermissionName,
      );

      expect(queryBuilderSpy).toHaveBeenCalledWith(
        validUserId,
        validCompanyId,
        validPermissionName,
      );
    });

    it('should call the prismaClient.userCompanyRole.findFirst method with the query returned by the companyRoleAndPermissionDbQueryBuilder', async () => {
      const queryBuilderReturn = {
        where: {
          userId: validUserId,
          companyId: validCompanyId,
          role: {
            permissions: {
              some: {
                name: validPermissionName,
              },
            },
          },
        },
      } as unknown as Prisma.UserCompanyRoleFindFirstArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildFindFirstUserCompanyRoleWithPermission',
        )
        .mockReturnValue(queryBuilderReturn);

      await service.checkUserPermission(
        validUserId,
        validCompanyId,
        validPermissionName,
      );

      expect(prismaClient.userCompanyRole.findFirst).toHaveBeenCalledWith(
        queryBuilderReturn,
      );
    });

    it('should throw an error if the prismaClient.userCompanyRole.findFirst method throws an error', async () => {
      const queryBuilderReturn = {
        where: {
          userId: validUserId,
          companyId: validCompanyId,
          role: {
            permissions: {
              some: {
                name: validPermissionName,
              },
            },
          },
        },
      } as unknown as Prisma.UserCompanyRoleFindFirstArgs;
      jest
        .spyOn(
          companyRoleAndPermissionDbQueryBuilder,
          'buildFindFirstUserCompanyRoleWithPermission',
        )
        .mockReturnValue(queryBuilderReturn);
      jest
        .spyOn(prismaClient.userCompanyRole, 'findFirst')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.checkUserPermission(
          validUserId,
          validCompanyId,
          validPermissionName,
        ),
      ).rejects.toThrow('Database error');
    });
  });

  describe('retrieveSelectUserPermissions', () => {
    const validUserId = 'valid-user-uuid';
    const validCompanyId = 'valid-company-uuid';
    const validPermissions = [
      $Enums.PermissionName.ManageBilling,
      $Enums.PermissionName.ManageCompanyRoles,
    ];
    const invalidUserId = 'invalid-user-uuid';
    const invalidCompanyId = 'invalid-company-uuid';

    it('should return a set of permissions that the user has', async () => {
      const userCompanyRolesWithPermissions = [
        {
          role: {
            permissions: [
              { name: $Enums.PermissionName.ManageBilling },
              { name: $Enums.PermissionName.ManageCompanyRoles },
            ],
          },
        },
      ];
      jest
        .spyOn(prismaClient.userCompanyRole, 'findMany')
        .mockResolvedValue(userCompanyRolesWithPermissions as any);

      const result = await service.retrieveSelectUserPermissions(
        validUserId,
        validCompanyId,
        validPermissions,
      );

      expect(result).toEqual(new Set(validPermissions));
    });

    it('should return an empty set if the user does not have any of the specified permissions', async () => {
      jest
        .spyOn(prismaClient.userCompanyRole, 'findMany')
        .mockResolvedValue([]);

      const result = await service.retrieveSelectUserPermissions(
        validUserId,
        validCompanyId,
        validPermissions,
      );

      expect(result).toEqual(new Set());
    });

    it('should throw an error if the user ID is empty', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.retrieveSelectUserPermissions(
          '',
          validCompanyId,
          validPermissions,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(prismaClient.userCompanyRole.findMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the user ID is not a valid UUID', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.retrieveSelectUserPermissions(
          invalidUserId,
          validCompanyId,
          validPermissions,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(prismaClient.userCompanyRole.findMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the company ID is empty', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.retrieveSelectUserPermissions(
          validUserId,
          '',
          validPermissions,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(prismaClient.userCompanyRole.findMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the company ID is not a valid UUID', async () => {
      jest.spyOn(uuidUtils, 'isUUID').mockReturnValue(false);

      await expect(
        service.retrieveSelectUserPermissions(
          validUserId,
          invalidCompanyId,
          validPermissions,
        ),
      ).rejects.toThrow(InvalidUUIDError);
      expect(prismaClient.userCompanyRole.findMany).not.toHaveBeenCalled();
    });

    it('should throw an error if the permissions array is empty', async () => {
      await expect(
        service.retrieveSelectUserPermissions(validUserId, validCompanyId, []),
      ).rejects.toThrow('cannot send empty array');
      expect(prismaClient.userCompanyRole.findMany).not.toHaveBeenCalled();
    });

    it('should call the prismaClient.userCompanyRole.findMany method with the correct query', async () => {
      const expectedQuery = {
        where: {
          userId: validUserId,
          companyId: validCompanyId,
          role: {
            permissions: {
              some: {
                name: {
                  in: validPermissions,
                },
              },
            },
          },
        },
        select: {
          role: {
            select: {
              permissions: {
                where: {
                  name: {
                    in: validPermissions,
                  },
                },
                select: {
                  name: true,
                },
              },
            },
          },
        },
      };
      jest
        .spyOn(prismaClient.userCompanyRole, 'findMany')
        .mockResolvedValue([]);

      await service.retrieveSelectUserPermissions(
        validUserId,
        validCompanyId,
        validPermissions,
      );

      expect(prismaClient.userCompanyRole.findMany).toHaveBeenCalledWith(
        expectedQuery,
      );
    });

    it('should throw an error if the prismaClient.userCompanyRole.findMany method throws an error', async () => {
      jest
        .spyOn(prismaClient.userCompanyRole, 'findMany')
        .mockRejectedValue(new Error('Database error'));

      await expect(
        service.retrieveSelectUserPermissions(
          validUserId,
          validCompanyId,
          validPermissions,
        ),
      ).rejects.toThrow('Database error');
    });

    it('should return a set containing only the specified permissions that the user has', async () => {
      const userCompanyRolesWithPermissions = [
        {
          role: {
            permissions: [{ name: $Enums.PermissionName.ManageBilling }],
          },
        },
      ];
      jest
        .spyOn(prismaClient.userCompanyRole, 'findMany')
        .mockResolvedValue(userCompanyRolesWithPermissions as any);

      const result = await service.retrieveSelectUserPermissions(
        validUserId,
        validCompanyId,
        validPermissions,
      );

      expect(result).toEqual(new Set([$Enums.PermissionName.ManageBilling]));
    });

    it('should not include duplicate permissions in the returned set', async () => {
      const userCompanyRolesWithPermissions = [
        {
          role: {
            permissions: [
              { name: $Enums.PermissionName.ManageBilling },
              { name: $Enums.PermissionName.ManageBilling },
            ],
          },
        },
      ];
      jest
        .spyOn(prismaClient.userCompanyRole, 'findMany')
        .mockResolvedValue(userCompanyRolesWithPermissions as any);

      const result = await service.retrieveSelectUserPermissions(
        validUserId,
        validCompanyId,
        [$Enums.PermissionName.ManageBilling],
      );

      expect(result).toEqual(new Set([$Enums.PermissionName.ManageBilling]));
    });
  });
});
