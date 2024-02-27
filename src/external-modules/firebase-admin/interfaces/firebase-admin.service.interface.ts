export interface IFirebaseAdminService {
  verifyToken(token: string): Promise<any>;
}
