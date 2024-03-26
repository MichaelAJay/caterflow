export interface ICompanyRoleAndPermissionDbHandler {
  initializeRoles: () => {};
  createRole: () => {};
  editRole: () => {};
  deleteRole: () => {};
  assignRolesToUser: () => {};
  unassignRolesToUser: () => {};
  checkUserPermission: () => {};
}
