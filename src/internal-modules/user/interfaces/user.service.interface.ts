export interface IUserService {
  getAccountByExternalUID(externalUID: string): Promise<{ id: string } | null>;
}
