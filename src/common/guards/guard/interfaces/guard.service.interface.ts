export interface IGuardService {
  /**
   * Wraps token retrieval and verification
   * Throws 401 if token not found
   * Throws 403 if token does not have string 'name' property and 'email'
   */
  verifyToken(request: any): Promise<any>;
  isVerifiedPayload(payload: any): boolean;
}
