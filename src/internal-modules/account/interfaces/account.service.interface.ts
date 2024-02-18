export interface IAccountService {
  createAccount(
    name: string,
    owner: string,
    email: string,
    password: string,
  ): Promise<any>;
}
