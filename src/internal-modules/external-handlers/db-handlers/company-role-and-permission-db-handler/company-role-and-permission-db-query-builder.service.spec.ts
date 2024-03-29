import { Test, TestingModule } from '@nestjs/testing';
import { CompanyRoleAndPermissionDbQueryBuilderService } from './company-role-and-permission-db-query-builder.service';
import { $Enums, Prisma } from '@prisma/client';
import {
  IBuildCreateCompanyRoleArgs,
  IBuildUpdateCompanyRoleArgs,
} from './interfaces/query-builder-args.interface';

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

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('buildCreateManySingleCompanyRolesQuery', () => {
  //   let systemRolesWithPermissions: ({
  //     permissions: {
  //       id: number;
  //       name: $Enums.PermissionName;
  //     }[];
  //   } & {
  //     id: string;
  //     name: string;
  //     description: string;
  //     companyId: string | null;
  //     creatorId: string;
  //     isEditable: boolean;
  //   })[];
  //   it('returns an empty array when systemRolesWithPermissions is empty', () => {
  //     systemRolesWithPermissions = [];
  //     const companyId = 'test-company-id';
  //     const creatorId = 'test-creator-id';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     expect(result).toEqual([]);
  //   });

  //   it('creates a single role with correct structure when provided one system role with no permissions', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'TestRole',
  //         description: 'Test Description',
  //         permissions: [],
  //         companyId: null,
  //         creatorId: 'creator-id',
  //         isEditable: true,
  //       },
  //     ];
  //     const companyId = 'company-id';
  //     const creatorId = 'creator-id';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     expect(result).toEqual([
  //       {
  //         data: {
  //           name: 'TestRole',
  //           description: 'Test Description',
  //           companyId: companyId,
  //           creatorId: creatorId,
  //           isEditable: false,
  //         },
  //       },
  //     ]);
  //   });

  //   it('creates multiple roles with correct structure when provided multiple system roles with no permissions', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'RoleOne',
  //         description: 'Description One',
  //         permissions: [],
  //         companyId: null,
  //         creatorId: 'creator-id-1',
  //         isEditable: true,
  //       },
  //       {
  //         id: '2',
  //         name: 'RoleTwo',
  //         description: 'Description Two',
  //         permissions: [],
  //         companyId: null,
  //         creatorId: 'creator-id-2',
  //         isEditable: true,
  //       },
  //     ];
  //     const companyId = 'company-id';
  //     const creatorId = 'shared-creator-id';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     expect(result).toEqual([
  //       {
  //         data: {
  //           name: 'RoleOne',
  //           description: 'Description One',
  //           companyId: companyId,
  //           creatorId: creatorId,
  //           isEditable: false,
  //         },
  //       },
  //       {
  //         data: {
  //           name: 'RoleTwo',
  //           description: 'Description Two',
  //           companyId: companyId,
  //           creatorId: creatorId,
  //           isEditable: false,
  //         },
  //       },
  //     ]);
  //   });

  //   it('assigns companyId from argument to all role records', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'RoleOne',
  //         description: 'Description One',
  //         permissions: [],
  //         companyId: null,
  //         creatorId: 'creator-id-1',
  //         isEditable: true,
  //       },
  //       {
  //         id: '2',
  //         name: 'RoleTwo',
  //         description: 'Description Two',
  //         permissions: [],
  //         companyId: null,
  //         creatorId: 'creator-id-2',
  //         isEditable: true,
  //       },
  //     ];
  //     const companyId = 'specific-company-id';
  //     const creatorId = 'creator-id';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     // Check that every role has the correct companyId assigned
  //     result.forEach((roleRecord) => {
  //       expect(roleRecord.data.companyId).toEqual(companyId);
  //     });
  //   });

  //   it('assigns creatorId from argument to all role records', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'RoleOne',
  //         description: 'Description for RoleOne',
  //         permissions: [],
  //         companyId: null,
  //         creatorId: 'original-creator-id',
  //         isEditable: true,
  //       },
  //       {
  //         id: '2',
  //         name: 'RoleTwp',
  //         description: 'Description for RoleTwo',
  //         permissions: [],
  //         companyId: null,
  //         creatorId: 'original-creator-id',
  //         isEditable: true,
  //       },
  //     ];

  //     const companyId = 'company-id';
  //     const creatorId = 'assigned-creator-id';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     result.forEach((roleRecord) => {
  //       expect(roleRecord.data.creatorId).toEqual(creatorId);
  //     });
  //   });

  //   it('sets isEditable to false for all role records', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'RoleOne',
  //         description: 'Description for RoleOne',
  //         permissions: [],
  //         companyId: null,
  //         creatorId: 'another-creator-id',
  //         isEditable: true,
  //       },
  //       {
  //         id: '2',
  //         name: 'RoleTwo',
  //         description: 'Description for RoleTwo',
  //         permissions: [],
  //         companyId: null,
  //         creatorId: 'another-creator-id',
  //         isEditable: true,
  //       },
  //     ];

  //     const companyId = 'another-company-id';
  //     const creatorId = 'another-creator-id';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     result.forEach((roleRecord) => {
  //       expect(roleRecord.data.isEditable).toBe(false);
  //     });
  //   });

  //   it('creates a single role with one permission correctly connected', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '3',
  //         name: 'RoleThree',
  //         description: 'Description for RoleThree',
  //         permissions: [
  //           {
  //             id: 100,
  //             name: 'ManageBilling',
  //           },
  //         ],
  //         companyId: null,
  //         creatorId: 'yet-another-creator-id',
  //         isEditable: true,
  //       },
  //     ];

  //     const companyId = 'yet-another-company-id';
  //     const creatorId = 'yet-another-creator-id';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     const expectedPermissionsConnection = [{ id: 100 }];
  //     expect(
  //       (result[0].data as { permissions: any }).permissions.connect,
  //     ).toEqual(expectedPermissionsConnection);
  //   });

  //   it('creates a single role with multiple permissions correctly connected', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'Role1',
  //         description: 'Role1 Description',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 1, name: 'ManageBilling' },
  //           { id: 2, name: 'ManageCompanyRoles' },
  //         ],
  //       },
  //     ];
  //     const companyId = '1';
  //     const creatorId = '1';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     const expected: Prisma.RoleCreateArgs[] = [
  //       {
  //         data: {
  //           name: 'Role1',
  //           description: 'Role1 Description',
  //           companyId: '1',
  //           creatorId: '1',
  //           isEditable: false,
  //           permissions: {
  //             connect: [{ id: 1 }, { id: 2 }],
  //           },
  //         },
  //       },
  //     ];

  //     expect(result).toEqual(expected);
  //   });

  //   it('creates multiple roles, each with their own set of permissions correctly connected', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'Role1',
  //         description: 'Role1 Description',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 1, name: 'ManageBilling' },
  //           { id: 2, name: 'ManageCompanyRoles' },
  //         ],
  //       },
  //       {
  //         id: '2',
  //         name: 'Role2',
  //         description: 'Role2 Description',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 3, name: 'ManageIntegrations' },
  //           { id: 4, name: 'ManageIntegrationAssets' },
  //         ],
  //       },
  //     ];
  //     const companyId = '1';
  //     const creatorId = '1';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     const expected: Prisma.RoleCreateArgs[] = [
  //       {
  //         data: {
  //           name: 'Role1',
  //           description: 'Role1 Description',
  //           companyId: '1',
  //           creatorId: '1',
  //           isEditable: false,
  //           permissions: {
  //             connect: [{ id: 1 }, { id: 2 }],
  //           },
  //         },
  //       },
  //       {
  //         data: {
  //           name: 'Role2',
  //           description: 'Role2 Description',
  //           companyId: '1',
  //           creatorId: '1',
  //           isEditable: false,
  //           permissions: {
  //             connect: [{ id: 3 }, { id: 4 }],
  //           },
  //         },
  //       },
  //     ];

  //     expect(result).toEqual(expected);
  //   });

  //   it('preserves the name and description of each role from the input', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'Role1',
  //         description: 'Role1 Description',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 1, name: 'ManageBilling' },
  //           { id: 2, name: 'ManageRoleAssignments' },
  //         ],
  //       },
  //       {
  //         id: '2',
  //         name: 'Role2',
  //         description: 'Role2 Description',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 3, name: 'ManageBilling' },
  //           { id: 4, name: 'ManageCompanyRoles' },
  //         ],
  //       },
  //     ];
  //     const companyId = '1';
  //     const creatorId = '1';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     result.forEach((role, index) => {
  //       expect(role.data.name).toEqual(systemRolesWithPermissions[index].name);
  //       expect(role.data.description).toEqual(
  //         systemRolesWithPermissions[index].description,
  //       );
  //     });
  //   });

  //   it('handles roles with null companyId gracefully by assigning the provided companyId to all roles', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'Role1',
  //         description: 'Role1 Description',
  //         companyId: null,
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 1, name: 'ManageBilling' },
  //           { id: 2, name: 'ManageCompanyRoles' },
  //         ],
  //       },
  //       {
  //         id: '2',
  //         name: 'Role2',
  //         description: 'Role2 Description',
  //         companyId: null,
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 3, name: 'ManageIntegrationAssets' },
  //           { id: 4, name: 'ManageIntegrations' },
  //         ],
  //       },
  //     ];
  //     const companyId = '1';
  //     const creatorId = '1';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     result.forEach((role) => {
  //       expect(role.data.companyId).toEqual(companyId);
  //     });
  //   });

  //   it('does not mutate the input array', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'Role1',
  //         description: 'Role1 Description',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 1, name: 'ManageBilling' },
  //           { id: 2, name: 'ManageCompanyRoles' },
  //         ],
  //       },
  //       {
  //         id: '2',
  //         name: 'Role2',
  //         description: 'Role2 Description',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 3, name: 'ManageIntegrationAssets' },
  //           { id: 4, name: 'ManageIntegrations' },
  //         ],
  //       },
  //     ];
  //     const companyId = '1';
  //     const creatorId = '1';

  //     // const originalInput = JSON.parse(
  //     //   JSON.stringify(systemRolesWithPermissions),
  //     // );
  //     const originalInput = [...systemRolesWithPermissions];

  //     service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     expect(systemRolesWithPermissions).toEqual(originalInput);
  //   });

  //   it('correctly handles roles with special characters in name and description', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'Role1$%^&*()',
  //         description: 'Role1 Description!@#',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 1, name: 'ManageBilling' },
  //           { id: 2, name: 'ManageCompanyRoles' },
  //         ],
  //       },
  //       {
  //         id: '2',
  //         name: 'Role2<>?":{}|',
  //         description: 'Role2 Description~`',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: false,
  //         permissions: [
  //           { id: 3, name: 'ManageIntegrationAssets' },
  //           { id: 4, name: 'ManageIntegrations' },
  //         ],
  //       },
  //     ];
  //     const companyId = '1';
  //     const creatorId = '1';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     result.forEach((role, index) => {
  //       expect(role.data.name).toEqual(systemRolesWithPermissions[index].name);
  //       expect(role.data.description).toEqual(
  //         systemRolesWithPermissions[index].description,
  //       );
  //     });
  //   });

  //   it('ensures all roles created are marked as not editable', () => {
  //     systemRolesWithPermissions = [
  //       {
  //         id: '1',
  //         name: 'Role1',
  //         description: 'Role1 Description',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: true, // This should be ignored
  //         permissions: [
  //           { id: 1, name: 'ManageBilling' },
  //           { id: 2, name: 'ManageCompanyRoles' },
  //         ],
  //       },
  //       {
  //         id: '2',
  //         name: 'Role2',
  //         description: 'Role2 Description',
  //         companyId: '1',
  //         creatorId: '1',
  //         isEditable: true, // This should be ignored
  //         permissions: [
  //           { id: 3, name: 'ManageIntegrationAssets' },
  //           { id: 4, name: 'ManageIntegrations' },
  //         ],
  //       },
  //     ];
  //     const companyId = '1';
  //     const creatorId = '1';

  //     const result = service.buildCreateManySingleCompanyRolesQuery(
  //       systemRolesWithPermissions,
  //       companyId,
  //       creatorId,
  //     );

  //     result.forEach((role) => {
  //       expect(role.data.isEditable).toEqual(false);
  //     });
  //   });
  // });
  // describe('buildCreateCompanyRoleQuery', () => {
  //   it('returns an object with only a data property whose value is the provided input', () => {
  //     const input: IBuildCreateCompanyRoleArgs = {
  //       name: '',
  //       description: '',
  //       companyId: '',
  //       creatorId: '',
  //     };
  //     const output = { data: input };
  //     const result = service.buildCreateCompanyRoleQuery(input);
  //     expect(result).toEqual(output);
  //   });
  // });
  // describe('buildRetrieveRoleQuery', () => {
  //   it('returns an object with only a where property', () => {
  //     const inputId = '11223';
  //     const expectedResult = { where: { id: inputId } };

  //     const result = service.buildRetrieveRoleQuery(inputId);
  //     expect(result).toEqual(expectedResult);
  //   });
  // });
  describe('buildUpdateCompanyRoleQuery', () => {
    const mockId = 'role-id';

    it('should return correct query statement based on name and description in input', () => {
      const roleUpdates: IBuildUpdateCompanyRoleArgs = {
        name: 'Updated Role',
        description: 'Updated description',
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, roleUpdates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          name: roleUpdates.name,
          description: roleUpdates.description,
        },
      });
    });

    it('should add permissions when add permissions are provided', () => {
      const permissionsToAdd = [1, 2, 3];
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: permissionsToAdd,
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            connect: permissionsToAdd.map((id) => ({ id })),
          },
        },
      });
    });

    it('should remove permissions when remove permissions are provided', () => {
      const permissionsToRemove = [4, 5, 6];
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          remove: permissionsToRemove,
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            disconnect: permissionsToRemove.map((id) => ({ id })),
          },
        },
      });
    });

    it('should add and remove permissions when both add and remove permissions are provided', () => {
      const permissionsToAdd = [1, 2, 3];
      const permissionsToRemove = [4, 5, 6];
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: permissionsToAdd,
          remove: permissionsToRemove,
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            connect: permissionsToAdd.map((id) => ({ id })),
            disconnect: permissionsToRemove.map((id) => ({ id })),
          },
        },
      });
    });

    it('should not include permissions in the update query when permissions are not provided', () => {
      const updates: IBuildUpdateCompanyRoleArgs = {
        name: 'Updated Role',
        description: 'Updated description',
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          name: updates.name,
          description: updates.description,
        },
      });
      expect(result.data).not.toHaveProperty('permissions');
    });

    it('should return the correct Prisma.RoleUpdateArgs object', () => {
      const updates: IBuildUpdateCompanyRoleArgs = {
        name: 'Updated Role',
        description: 'Updated description',
        permissions: {
          add: [1, 2, 3],
          remove: [4, 5, 6],
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toMatchObject({
        where: { id: mockId },
        data: {
          name: updates.name,
          description: updates.description,
          permissions: {
            connect: updates.permissions?.add?.map((id) => ({ id })),
            disconnect: updates.permissions?.remove?.map((id) => ({ id })),
          },
        },
      } as Prisma.RoleUpdateArgs);
    });

    it('should handle an empty updates object', () => {
      const updates: IBuildUpdateCompanyRoleArgs = {};

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {},
      });
    });

    it('should handle updates with only permissions', () => {
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: [1, 2, 3],
          remove: [4, 5, 6],
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            connect: updates.permissions?.add?.map((id) => ({ id })),
            disconnect: updates.permissions?.remove?.map((id) => ({ id })),
          },
        },
      });
    });

    it('should handle updates with only roleUpdates', () => {
      const updates: IBuildUpdateCompanyRoleArgs = {
        name: 'Updated Role',
        description: 'Updated description',
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          name: updates.name,
          description: updates.description,
        },
      });
    });

    it('should handle an empty add permissions array', () => {
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: [],
          remove: [4, 5, 6],
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            disconnect: updates.permissions?.remove?.map((id) => ({ id })),
          },
        },
      });
    });

    it('should handle an empty remove permissions array', () => {
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: [1, 2, 3],
          remove: [],
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            connect: updates.permissions?.add?.map((id) => ({ id })),
          },
        },
      });
    });

    it('should handle an empty add and remove permissions array', () => {
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: [],
          remove: [],
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {},
      });
    });

    it('should handle a large number of add permissions', () => {
      const largeAddPermissions = Array.from(
        { length: 1000 },
        (_, index) => index + 1,
      );
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: largeAddPermissions,
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            connect: updates.permissions?.add?.map((id) => ({ id })),
          },
        },
      });
    });

    it('should handle a large number of remove permissions', () => {
      const largeRemovePermissions = Array.from(
        { length: 1000 },
        (_, index) => index + 1,
      );
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          remove: largeRemovePermissions,
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            disconnect: updates.permissions?.remove?.map((id) => ({ id })),
          },
        },
      });
    });

    it('should handle a large number of add and remove permissions', () => {
      const largeAddPermissions = Array.from(
        { length: 1000 },
        (_, index) => index + 1,
      );
      const largeRemovePermissions = Array.from(
        { length: 1000 },
        (_, index) => index + 1001,
      );
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: largeAddPermissions,
          remove: largeRemovePermissions,
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            connect: updates.permissions?.add?.map((id) => ({ id })),
            disconnect: updates.permissions?.remove?.map((id) => ({ id })),
          },
        },
      });
    });

    it('should handle a very long id', () => {
      const longId = 'a'.repeat(1000);
      const updates: IBuildUpdateCompanyRoleArgs = {
        name: 'Updated Role',
        description: 'Updated description',
      };

      const result = service.buildUpdateCompanyRoleQuery(longId, updates);

      expect(result).toEqual({
        where: { id: longId },
        data: {
          name: updates.name,
          description: updates.description,
        },
      });
    });

    it('should handle special characters in the id', () => {
      const specialCharacterId = '!@#$%^&*()_+{}[]|:;"<>,.?/~`';
      const updates: IBuildUpdateCompanyRoleArgs = {
        name: 'Updated Role',
        description: 'Updated description',
      };

      const result = service.buildUpdateCompanyRoleQuery(
        specialCharacterId,
        updates,
      );

      expect(result).toEqual({
        where: { id: specialCharacterId },
        data: {
          name: updates.name,
          description: updates.description,
        },
      });
    });

    it('should handle duplicate permission ids in the add permissions array', () => {
      const duplicateAddPermissionIds = [1, 2, 3, 2, 3, 4];
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: duplicateAddPermissionIds,
        },
      };

      const dedupedAddPermissionIds = [...new Set(duplicateAddPermissionIds)];

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            connect: dedupedAddPermissionIds.map((id) => ({ id })),
          },
        },
      });
    });

    it('should handle duplicate permission ids in the remove permissions array', () => {
      const duplicateRemovePermissionIds = [4, 5, 6, 5, 6, 7];
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          remove: duplicateRemovePermissionIds,
        },
      };

      const dedupedRemovePermissionIds = [
        ...new Set(duplicateRemovePermissionIds),
      ];

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            disconnect: dedupedRemovePermissionIds.map((id) => ({ id })),
          },
        },
      });
    });

    it('should handle duplicate permission ids in both add and remove permissions arrays', () => {
      const duplicateAddPermissionIds = [1, 2, 3, 2, 3, 4];
      const duplicateRemovePermissionIds = [4, 5, 6, 5, 6, 7];
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: duplicateAddPermissionIds,
          remove: duplicateRemovePermissionIds,
        },
      };

      const dedupedAddPermissionIds = [...new Set(duplicateAddPermissionIds)];
      const dedupedRemovePermissionIds = [
        ...new Set(duplicateRemovePermissionIds),
      ];

      const filteredConnectIds = dedupedAddPermissionIds.filter(
        (id) => !dedupedRemovePermissionIds.includes(id),
      );

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            connect: filteredConnectIds.map((id) => ({ id })),
            disconnect: dedupedRemovePermissionIds.map((id) => ({
              id,
            })),
          },
        },
      });
    });

    it('should handle a permission id that appears in both add and remove permissions arrays', () => {
      const overlappingPermissionIds = [1, 2, 3];
      const updates: IBuildUpdateCompanyRoleArgs = {
        permissions: {
          add: overlappingPermissionIds,
          remove: overlappingPermissionIds,
        },
      };

      const result = service.buildUpdateCompanyRoleQuery(mockId, updates);

      expect(result).toEqual({
        where: { id: mockId },
        data: {
          permissions: {
            disconnect: overlappingPermissionIds.map((id) => ({ id })),
          },
        },
      });
    });
  });
  describe('buildDeleteCompanyRoleQuery', () => {
    it('returns object with where clause specifying id and companyId', () => {
      const id = '123';
      const companyId = 'aab';
      const expectedResult = { where: { id, companyId } };
      const result = service.buildDeleteCompanyRoleQuery(id, companyId);
      expect(result).toEqual(expectedResult);
    });
  });
  describe('buildDeleteManyCompanyRolesQuery', () => {});
  describe('buildCreateManyCompanyUserRolesQuery', () => {});
  describe('buildDeleteManyCompanyUserRolesQuery', () => {});
  describe('buildFindFirstUserCompanyRoleWithPermission', () => {});
});
