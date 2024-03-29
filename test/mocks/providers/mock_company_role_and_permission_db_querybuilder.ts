import { ICompanyRoleAndPermissionDbQueryBuilder } from 'src/internal-modules/external-handlers/db-handlers/company-role-and-permission-db-handler/interfaces/company-role-and-permission-db-query-builder.service.interface';

export const mockCompanyRoleAndPermissionDbQueryBuilder: ICompanyRoleAndPermissionDbQueryBuilder =
  {
    buildCreateManySingleCompanyRolesQuery: jest.fn(),
    buildCreateCompanyRoleQuery: jest.fn(),
    buildRetrieveRoleQuery: jest.fn(),
    buildUpdateCompanyRoleQuery: jest.fn(),
    buildDeleteCompanyRoleQuery: jest.fn(),
    buildDeleteManyCompanyRolesQuery: jest.fn(),
    buildCreateManyCompanyUserRolesQuery: jest.fn(),
    buildDeleteManyCompanyUserRolesQuery: jest.fn(),
    buildFindFirstUserCompanyRoleWithPermission: jest.fn(),
  };
