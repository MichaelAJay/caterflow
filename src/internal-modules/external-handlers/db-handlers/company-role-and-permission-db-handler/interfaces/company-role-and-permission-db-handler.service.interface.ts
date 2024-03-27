export interface ICompanyRoleAndPermissionDbHandler {
  initializeRoles: (companyId: string, creatorId: string) => Promise<any>;
  createRole: () => Promise<any>;
  editRole: () => Promise<any>;
  deleteRole: () => Promise<any>;
  assignRolesToUser: () => Promise<any>;
  unassignRolesToUser: () => Promise<any>;
  checkUserPermission: () => Promise<any>;
}
