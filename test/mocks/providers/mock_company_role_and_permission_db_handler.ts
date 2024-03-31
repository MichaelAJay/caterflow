import { ICompanyRoleAndPermissionDbHandler } from 'src/internal-modules/external-handlers/db-handlers/company-role-and-permission-db-handler/interfaces/company-role-and-permission-db-handler.service.interface';

export const mockCompanyRoleAndPermissionDbHandler: ICompanyRoleAndPermissionDbHandler =
  {
    initializeRolesAndAssignOwner: jest.fn(),
    createRole: jest.fn(),
    editRole: jest.fn(),
    deleteRoles: jest.fn(),
    addRolesToUser: jest.fn(),
    removeRolesFromUser: jest.fn(),
    checkUserPermission: jest.fn(),
    retrieveRole: jest.fn(),
    retrieveSelectUserPermissions: jest.fn(),
  };
