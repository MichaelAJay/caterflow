/**
 * Unexpected errors should be handled by the SecretManager that injects this service
 */
export interface IExternalSecretManager {
  getSecret(secretName: string): Promise<string>;
  upsertSecret(secretName: string, secretValue: Buffer): Promise<void>;
}
