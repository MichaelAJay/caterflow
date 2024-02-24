export interface IUserDbHandler {
  createUser(): Promise<any>;
  retrieveUserByExternalAuthUID(externalAuthUID: string): Promise<any>;
}
