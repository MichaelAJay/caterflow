export interface IAccountDbHandler {
  createAccount(name: string): Promise<any>;
}
