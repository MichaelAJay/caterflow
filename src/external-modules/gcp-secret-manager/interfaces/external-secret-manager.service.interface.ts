export interface IExternalSecretManager {
  getSecret(secretName: string): Promise<string>;
  upsertSecret(secretName: string, secretValue: Buffer): Promise<void>;
}
