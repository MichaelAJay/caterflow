import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { $Enums, Prisma } from '@prisma/client';

describe('CompanyRoleAndPermissionDbQueryBuilderService', () => {
  let service: CompanyRoleAndPermissionDbQueryBuilderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyRoleAndPermissionDbQueryBuilderService],
    }).compile();

    service = module.get<CompanyRoleAndPermissionDbQueryBuilderService>(
      CompanyRoleAndPermissionDbQueryBuilderService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildCreateManySingleCompanyRolesQuery', () => {
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
    it('returns an empty array when systemRolesWithPermissions is empty', () => {
      systemRolesWithPermissions = [];
      const companyId = 'test-company-id';
      const creatorId = 'test-creator-id';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      expect(result).toEqual([]);
    });

    it('creates a single role with correct structure when provided one system role with no permissions', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'TestRole',
          description: 'Test Description',
          permissions: [],
          companyId: null,
          creatorId: 'creator-id',
          isEditable: true,
        },
      ];
      const companyId = 'company-id';
      const creatorId = 'creator-id';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      expect(result).toEqual([
        {
          data: {
            name: 'TestRole',
            description: 'Test Description',
            companyId: companyId,
            creatorId: creatorId,
            isEditable: false,
            permissions: {
              connect: [],
            },
          },
        },
      ]);
    });

    it('creates multiple roles with correct structure when provided multiple system roles with no permissions', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'RoleOne',
          description: 'Description One',
          permissions: [],
          companyId: null,
          creatorId: 'creator-id-1',
          isEditable: true,
        },
        {
          id: '2',
          name: 'RoleTwo',
          description: 'Description Two',
          permissions: [],
          companyId: null,
          creatorId: 'creator-id-2',
          isEditable: true,
        },
      ];
      const companyId = 'company-id';
      const creatorId = 'shared-creator-id';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      expect(result).toEqual([
        {
          data: {
            name: 'RoleOne',
            description: 'Description One',
            companyId: companyId,
            creatorId: creatorId,
            isEditable: false,
            permissions: {
              connect: [],
            },
          },
        },
        {
          data: {
            name: 'RoleTwo',
            description: 'Description Two',
            companyId: companyId,
            creatorId: creatorId,
            isEditable: false,
            permissions: {
              connect: [],
            },
          },
        },
      ]);
    });

    it('assigns companyId from argument to all role records', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'RoleOne',
          description: 'Description One',
          permissions: [],
          companyId: null,
          creatorId: 'creator-id-1',
          isEditable: true,
        },
        {
          id: '2',
          name: 'RoleTwo',
          description: 'Description Two',
          permissions: [],
          companyId: null,
          creatorId: 'creator-id-2',
          isEditable: true,
        },
      ];
      const companyId = 'specific-company-id';
      const creatorId = 'creator-id';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      // Check that every role has the correct companyId assigned
      result.forEach((roleRecord) => {
        expect(roleRecord.data.companyId).toEqual(companyId);
      });
    });

    it('assigns creatorId from argument to all role records', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'RoleOne',
          description: 'Description for RoleOne',
          permissions: [],
          companyId: null,
          creatorId: 'original-creator-id',
          isEditable: true,
        },
        {
          id: '2',
          name: 'RoleTwp',
          description: 'Description for RoleTwo',
          permissions: [],
          companyId: null,
          creatorId: 'original-creator-id',
          isEditable: true,
        },
      ];

      const companyId = 'company-id';
      const creatorId = 'assigned-creator-id';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      result.forEach((roleRecord) => {
        expect(roleRecord.data.creatorId).toEqual(creatorId);
      });
    });

    it('sets isEditable to false for all role records', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'RoleOne',
          description: 'Description for RoleOne',
          permissions: [],
          companyId: null,
          creatorId: 'another-creator-id',
          isEditable: true,
        },
        {
          id: '2',
          name: 'RoleTwo',
          description: 'Description for RoleTwo',
          permissions: [],
          companyId: null,
          creatorId: 'another-creator-id',
          isEditable: true,
        },
      ];

      const companyId = 'another-company-id';
      const creatorId = 'another-creator-id';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      result.forEach((roleRecord) => {
        expect(roleRecord.data.isEditable).toBe(false);
      });
    });

    it('creates a single role with one permission correctly connected', () => {
      systemRolesWithPermissions = [
        {
          id: '3',
          name: 'RoleThree',
          description: 'Description for RoleThree',
          permissions: [
            {
              id: 100,
              name: 'ManageBilling',
            },
          ],
          companyId: null,
          creatorId: 'yet-another-creator-id',
          isEditable: true,
        },
      ];

      const companyId = 'yet-another-company-id';
      const creatorId = 'yet-another-creator-id';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      const expectedPermissionsConnection = [{ id: 100 }];
      expect(
        (result[0].data as { permissions: any }).permissions.connect,
      ).toEqual(expectedPermissionsConnection);
    });

    it('creates a single role with multiple permissions correctly connected', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'Role1',
          description: 'Role1 Description',
          companyId: '1',
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 1, name: 'ManageBilling' },
            { id: 2, name: 'ManageCompanyRoles' },
          ],
        },
      ];
      const companyId = '1';
      const creatorId = '1';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      const expected: Prisma.RoleCreateArgs[] = [
        {
          data: {
            name: 'Role1',
            description: 'Role1 Description',
            companyId: '1',
            creatorId: '1',
            isEditable: false,
            permissions: {
              connect: [{ id: 1 }, { id: 2 }],
            },
          },
        },
      ];

      expect(result).toEqual(expected);
    });

    it('creates multiple roles, each with their own set of permissions correctly connected', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'Role1',
          description: 'Role1 Description',
          companyId: '1',
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 1, name: 'ManageBilling' },
            { id: 2, name: 'ManageCompanyRoles' },
          ],
        },
        {
          id: '2',
          name: 'Role2',
          description: 'Role2 Description',
          companyId: '1',
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 3, name: 'ManageIntegrations' },
            { id: 4, name: 'ManageIntegrationAssets' },
          ],
        },
      ];
      const companyId = '1';
      const creatorId = '1';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      const expected: Prisma.RoleCreateArgs[] = [
        {
          data: {
            name: 'Role1',
            description: 'Role1 Description',
            companyId: '1',
            creatorId: '1',
            isEditable: false,
            permissions: {
              connect: [{ id: 1 }, { id: 2 }],
            },
          },
        },
        {
          data: {
            name: 'Role2',
            description: 'Role2 Description',
            companyId: '1',
            creatorId: '1',
            isEditable: false,
            permissions: {
              connect: [{ id: 3 }, { id: 4 }],
            },
          },
        },
      ];

      expect(result).toEqual(expected);
    });

    it('preserves the name and description of each role from the input', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'Role1',
          description: 'Role1 Description',
          companyId: '1',
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 1, name: 'ManageBilling' },
            { id: 2, name: 'ManageRoleAssignments' },
          ],
        },
        {
          id: '2',
          name: 'Role2',
          description: 'Role2 Description',
          companyId: '1',
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 3, name: 'ManageBilling' },
            { id: 4, name: 'ManageCompanyRoles' },
          ],
        },
      ];
      const companyId = '1';
      const creatorId = '1';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      result.forEach((role, index) => {
        expect(role.data.name).toEqual(systemRolesWithPermissions[index].name);
        expect(role.data.description).toEqual(
          systemRolesWithPermissions[index].description,
        );
      });
    });

    it('handles roles with null companyId gracefully by assigning the provided companyId to all roles', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'Role1',
          description: 'Role1 Description',
          companyId: null,
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 1, name: 'ManageBilling' },
            { id: 2, name: 'ManageCompanyRoles' },
          ],
        },
        {
          id: '2',
          name: 'Role2',
          description: 'Role2 Description',
          companyId: null,
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 3, name: 'ManageIntegrationAssets' },
            { id: 4, name: 'ManageIntegrations' },
          ],
        },
      ];
      const companyId = '1';
      const creatorId = '1';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      result.forEach((role) => {
        expect(role.data.companyId).toEqual(companyId);
      });
    });

    it('does not mutate the input array', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'Role1',
          description: 'Role1 Description',
          companyId: '1',
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 1, name: 'ManageBilling' },
            { id: 2, name: 'ManageCompanyRoles' },
          ],
        },
        {
          id: '2',
          name: 'Role2',
          description: 'Role2 Description',
          companyId: '1',
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 3, name: 'ManageIntegrationAssets' },
            { id: 4, name: 'ManageIntegrations' },
          ],
        },
      ];
      const companyId = '1';
      const creatorId = '1';

      const originalInput = JSON.parse(
        JSON.stringify(systemRolesWithPermissions),
      );

      service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      expect(systemRolesWithPermissions).toEqual(originalInput);
    });

    it('correctly handles roles with special characters in name and description', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'Role1$%^&*()',
          description: 'Role1 Description!@#',
          companyId: '1',
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 1, name: 'ManageBilling' },
            { id: 2, name: 'ManageCompanyRoles' },
          ],
        },
        {
          id: '2',
          name: 'Role2<>?":{}|',
          description: 'Role2 Description~`',
          companyId: '1',
          creatorId: '1',
          isEditable: false,
          permissions: [
            { id: 3, name: 'ManageIntegrationAssets' },
            { id: 4, name: 'ManageIntegrations' },
          ],
        },
      ];
      const companyId = '1';
      const creatorId = '1';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      result.forEach((role, index) => {
        expect(role.data.name).toEqual(systemRolesWithPermissions[index].name);
        expect(role.data.description).toEqual(
          systemRolesWithPermissions[index].description,
        );
      });
    });

    it('ensures all roles created are marked as not editable', () => {
      systemRolesWithPermissions = [
        {
          id: '1',
          name: 'Role1',
          description: 'Role1 Description',
          companyId: '1',
          creatorId: '1',
          isEditable: true, // This should be ignored
          permissions: [
            { id: 1, name: 'ManageBilling' },
            { id: 2, name: 'ManageCompanyRoles' },
          ],
        },
        {
          id: '2',
          name: 'Role2',
          description: 'Role2 Description',
          companyId: '1',
          creatorId: '1',
          isEditable: true, // This should be ignored
          permissions: [
            { id: 3, name: 'ManageIntegrationAssets' },
            { id: 4, name: 'ManageIntegrations' },
          ],
        },
      ];
      const companyId = '1';
      const creatorId = '1';

      const result = service.buildCreateManySingleCompanyRolesQuery(
        systemRolesWithPermissions,
        companyId,
        creatorId,
      );

      result.forEach((role) => {
        expect(role.data.isEditable).toEqual(false);
      });
    });
  });
});
