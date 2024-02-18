export interface IAccountDbHandler {
  createAccount(name: string, ownerEmail: string): Promise<any>;
}
