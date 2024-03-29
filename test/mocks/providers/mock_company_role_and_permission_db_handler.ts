import { ICompanyRoleAndPermissionDbHandler } from 'src/internal-modules/external-handlers/db-handlers/company-role-and-permission-db-handler/interfaces/company-role-and-permission-db-handler.service.interface';

export const mockCompanyRoleAndPermissionDbHandler: ICompanyRoleAndPermissionDbHandler =
  {
    initializeRolesAndAssignOwnerRole: jest.fn(),
    createRole: jest.fn(),
    editRole: jest.fn(),
    deleteRole: jest.fn(),
    addRolesToUser: jest.fn(),
    removeRolesFromUser: jest.fn(),
    checkUserPermission: jest.fn(),
  };
