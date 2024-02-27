export interface IAccountService {
  /**
   * @param name account name
   * @param ownerId owner internal user.id
   */
  createAccount(name: string, ownerId: string): Promise<any>;
}
